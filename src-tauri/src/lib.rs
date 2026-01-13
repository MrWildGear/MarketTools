mod commands;
mod file_watcher;
mod market_parser;
mod profile;

use std::path::PathBuf;
use std::sync::Arc;
use tauri::Manager;
use tokio::sync::RwLock;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            // Get default log directory
            let log_dir = get_default_log_dir();
            let log_dir_arc = Arc::new(RwLock::new(log_dir.clone()));

            // Initialize file watcher
            let app_handle = app.handle().clone();
            let log_dir_for_watcher = log_dir_arc.clone();
            tauri::async_runtime::spawn(async move {
                file_watcher::watch_market_logs(app_handle, log_dir_for_watcher).await;
            });

            app.manage(log_dir_arc);

            // Initialize profiles directory
            let profiles_dir = app
                .path()
                .app_data_dir()
                .expect("Failed to get app data directory");
            std::fs::create_dir_all(&profiles_dir.join("profiles"))
                .expect("Failed to create profiles directory");

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::list_profiles,
            commands::load_profile,
            commands::save_profile,
            commands::delete_profile,
            commands::select_log_path,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn get_default_log_dir() -> PathBuf {
    #[cfg(windows)]
    {
        let mut path = PathBuf::from(std::env::var("USERPROFILE").unwrap_or_default());
        path.push("Documents");
        path.push("EVE");
        path.push("logs");
        path.push("marketlogs");
        path
    }

    #[cfg(unix)]
    {
        let mut path = PathBuf::from(std::env::var("HOME").unwrap_or_default());
        path.push(".local");
        path.push("share");
        path.push("EVE");
        path.push("logs");
        path.push("marketlogs");
        path
    }
}
