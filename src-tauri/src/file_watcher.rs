use crate::market_parser;
use crate::profile::Profile;
use std::path::PathBuf;
use std::sync::Arc;
use std::sync::mpsc;
use std::time::Duration;
use tauri::{AppHandle, Emitter};
use tokio::sync::RwLock;
use tokio::time::sleep;
use notify::{Config, EventKind, RecommendedWatcher, RecursiveMode, Watcher};

pub async fn watch_market_logs(
    app: AppHandle,
    log_dir: Arc<RwLock<PathBuf>>,
    current_profile: Arc<RwLock<Profile>>,
) {
    loop {
        let current_dir = log_dir.read().await.clone();

        if !current_dir.exists() {
            app.emit("status-update", "Waiting for market logs directory...")
                .ok();
            sleep(Duration::from_secs(5)).await;
            continue;
        }

        // Create directory if it doesn't exist
        if let Err(e) = std::fs::create_dir_all(&current_dir) {
            eprintln!("Failed to create log directory: {}", e);
            sleep(Duration::from_secs(5)).await;
            continue;
        }

        // Create file watcher
        let (tx, rx) = mpsc::channel();
        let (async_tx, mut async_rx) = tokio::sync::mpsc::channel(128);
        let mut watcher: RecommendedWatcher =
            Watcher::new(tx, Config::default()).expect("Failed to create watcher");

        if let Err(e) = watcher.watch(&current_dir, RecursiveMode::NonRecursive) {
            eprintln!("Failed to watch directory: {}", e);
            app.emit("status-update", format!("Watch error: {}", e)).ok();
            sleep(Duration::from_secs(5)).await;
            continue;
        }

        app.emit("status-update", "Watching for market logs...")
            .ok();

        // Spawn blocking task to receive from notify channel and forward to async channel
        let async_tx_clone = async_tx.clone();
        tokio::task::spawn_blocking(move || {
            loop {
                match rx.recv() {
                    Ok(event) => {
                        if async_tx_clone.blocking_send(event).is_err() {
                            break;
                        }
                    }
                    Err(_) => break,
                }
            }
        });

        // Listen for file changes from async channel
        loop {
            match async_rx.recv().await {
                Some(Ok(event)) => {
                    if let EventKind::Create(_) = event.kind {
                        for path in event.paths {
                            if path.extension().and_then(|s: &std::ffi::OsStr| s.to_str()) == Some("txt") {
                                // Wait a bit for file to be fully written
                                sleep(Duration::from_millis(100)).await;

                                // Try to read and parse the file
                                if let Ok(content) = std::fs::read_to_string(&path) {
                                    // Extract item name from filename
                                    let filename = path
                                        .file_name()
                                        .and_then(|n: &std::ffi::OsStr| n.to_str())
                                        .unwrap_or("");
                                    let item_name = market_parser::extract_item_name_from_filename(
                                        filename,
                                    );

                                    // Get current profile ranges
                                    let profile = current_profile.read().await;
                                    let buy_range = profile.buy_range;
                                    let sell_range = profile.sell_range;
                                    drop(profile); // Release the lock

                                    // Use profile ranges for filtering orders
                                    if let Some(mut market_data) =
                                        market_parser::parse_market_log(&content, buy_range, sell_range)
                                    {
                                        let item_name_clone = item_name.clone();
                                        market_data.item_name = item_name;
                                        app.emit("market-data", &market_data).ok();
                                        app.emit("status-update", format!("Processed: {}", item_name_clone))
                                            .ok();
                                    }
                                }
                            }
                        }
                    }
                }
                Some(Err(e)) => {
                    eprintln!("Watcher error: {}", e);
                }
                None => {
                    eprintln!("Channel closed");
                    break;
                }
            }
        }
    }
}
