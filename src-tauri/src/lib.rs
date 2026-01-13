mod commands;
mod file_watcher;
mod market_parser;
mod profile;
mod settings;

use std::path::PathBuf;
use std::sync::Arc;
use tauri::Manager;
use tokio::sync::RwLock;
use crate::settings::AppSettings;

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

            // Restore window state
            if let Some(window) = app.get_webview_window("main") {
                restore_window_state(&window, &profiles_dir);
            }

            // Set up window event listener to save window state on close
            let app_handle = app.handle().clone();
            if let Some(window) = app.get_webview_window("main") {
                let app_handle_clone = app_handle.clone();
                window.on_window_event(move |event| {
                    if let tauri::WindowEvent::CloseRequested { .. } = event {
                        if let Some(win) = app_handle_clone.get_webview_window("main") {
                            save_window_state(&win, &app_handle_clone);
                        }
                    }
                });
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::list_profiles,
            commands::load_profile,
            commands::save_profile,
            commands::delete_profile,
            commands::select_log_path,
            commands::load_settings,
            commands::save_settings,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn restore_window_state(window: &tauri::WebviewWindow, app_data_dir: &PathBuf) {
    if let Ok(settings) = AppSettings::load(app_data_dir) {
        if let (Some(x), Some(y)) = (settings.window_x, settings.window_y) {
            let pos = tauri::PhysicalPosition::new(x, y);
            let _ = window.set_position(pos);
        }
        if let (Some(width), Some(height)) = (settings.window_width, settings.window_height) {
            let size = tauri::PhysicalSize::new(width, height);
            let _ = window.set_size(size);
        }
    }
}

fn save_window_state(window: &tauri::WebviewWindow, app: &tauri::AppHandle) {
    if let Ok(app_data_dir) = app.path().app_data_dir() {
        let mut settings = AppSettings::load(&app_data_dir).unwrap_or_else(|_| AppSettings::default());
        
        if let Ok(pos) = window.outer_position() {
            settings.window_x = Some(pos.x);
            settings.window_y = Some(pos.y);
        }
        
        if let Ok(size) = window.outer_size() {
            settings.window_width = Some(size.width);
            settings.window_height = Some(size.height);
        }
        
        let _ = settings.save(&app_data_dir);
    }
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
