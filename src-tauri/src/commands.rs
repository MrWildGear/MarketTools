use crate::profile::Profile;
use crate::settings::AppSettings;
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter, Manager};

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProfileDto {
    pub char_id: u64,
    pub profile_name: String,
    pub margin_threshold: f64,
    pub minimum_threshold: f64,
    pub accounting: u8,
    pub broker_relations: u8,
    pub faction_standing: f64,
    pub corp_standing: f64,
    pub use_buy_custom_broker: bool,
    pub buy_custom_broker: f64,
    pub use_sell_custom_broker: bool,
    pub sell_custom_broker: f64,
    pub buy_range: u8,
    pub sell_range: u8,
}

impl From<Profile> for ProfileDto {
    fn from(profile: Profile) -> Self {
        ProfileDto {
            char_id: profile.char_id,
            profile_name: profile.profile_name,
            margin_threshold: profile.margin_threshold,
            minimum_threshold: profile.minimum_threshold,
            accounting: profile.accounting,
            broker_relations: profile.broker_relations,
            faction_standing: profile.faction_standing,
            corp_standing: profile.corp_standing,
            use_buy_custom_broker: profile.use_buy_custom_broker,
            buy_custom_broker: profile.buy_custom_broker,
            use_sell_custom_broker: profile.use_sell_custom_broker,
            sell_custom_broker: profile.sell_custom_broker,
            buy_range: profile.buy_range,
            sell_range: profile.sell_range,
        }
    }
}

impl From<ProfileDto> for Profile {
    fn from(dto: ProfileDto) -> Self {
        Profile {
            char_id: dto.char_id,
            profile_name: dto.profile_name,
            margin_threshold: dto.margin_threshold,
            minimum_threshold: dto.minimum_threshold,
            accounting: dto.accounting,
            broker_relations: dto.broker_relations,
            faction_standing: dto.faction_standing,
            corp_standing: dto.corp_standing,
            use_buy_custom_broker: dto.use_buy_custom_broker,
            buy_custom_broker: dto.buy_custom_broker,
            use_sell_custom_broker: dto.use_sell_custom_broker,
            sell_custom_broker: dto.sell_custom_broker,
            buy_range: dto.buy_range,
            sell_range: dto.sell_range,
        }
    }
}

fn get_profiles_dir(app: &AppHandle) -> Result<std::path::PathBuf, String> {
    app.path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data directory: {}", e))
}

fn get_app_data_dir(app: &AppHandle) -> Result<std::path::PathBuf, String> {
    app.path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data directory: {}", e))
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppSettingsDto {
    pub selected_profile: String,
    pub auto_copy_enabled: bool,
    pub auto_copy_mode: String,
}

impl From<AppSettings> for AppSettingsDto {
    fn from(settings: AppSettings) -> Self {
        AppSettingsDto {
            selected_profile: settings.selected_profile,
            auto_copy_enabled: settings.auto_copy_enabled,
            auto_copy_mode: settings.auto_copy_mode,
        }
    }
}

impl From<AppSettingsDto> for AppSettings {
    fn from(dto: AppSettingsDto) -> Self {
        AppSettings {
            selected_profile: dto.selected_profile,
            auto_copy_enabled: dto.auto_copy_enabled,
            auto_copy_mode: dto.auto_copy_mode,
        }
    }
}

#[tauri::command]
pub async fn load_settings(app: AppHandle) -> Result<AppSettingsDto, String> {
    let app_data_dir = get_app_data_dir(&app)?;
    let settings = AppSettings::load(&app_data_dir)
        .map_err(|e| format!("Failed to load settings: {}", e))?;
    Ok(AppSettingsDto::from(settings))
}

#[tauri::command]
pub async fn save_settings(app: AppHandle, settings: AppSettingsDto) -> Result<(), String> {
    let app_data_dir = get_app_data_dir(&app)?;
    let settings_rust: AppSettings = settings.into();
    settings_rust
        .save(&app_data_dir)
        .map_err(|e| format!("Failed to save settings: {}", e))?;
    Ok(())
}

#[tauri::command]
pub async fn list_profiles(app: AppHandle) -> Result<Vec<String>, String> {
    let profiles_dir = get_profiles_dir(&app)?;
    Profile::list_all(&profiles_dir)
        .map_err(|e| format!("Failed to list profiles: {}", e))
}

#[tauri::command]
pub async fn load_profile(
    app: AppHandle,
    profile_name: String,
) -> Result<Option<ProfileDto>, String> {
    let profiles_dir = get_profiles_dir(&app)?;
    let profile = Profile::load(&profiles_dir, &profile_name)
        .map_err(|e| format!("Failed to load profile: {}", e))?;
    Ok(Some(ProfileDto::from(profile)))
}

#[tauri::command]
pub async fn save_profile(app: AppHandle, profile: ProfileDto) -> Result<(), String> {
    let profiles_dir = get_profiles_dir(&app)?;
    let profile_rust: Profile = profile.into();
    profile_rust
        .save(&profiles_dir)
        .map_err(|e| format!("Failed to save profile: {}", e))?;
    Ok(())
}

#[tauri::command]
pub async fn delete_profile(app: AppHandle, profile_name: String) -> Result<(), String> {
    let profiles_dir = get_profiles_dir(&app)?;
    Profile::delete(&profiles_dir, &profile_name)
        .map_err(|e| format!("Failed to delete profile: {}", e))?;
    Ok(())
}

#[tauri::command]
pub async fn select_log_path(app: AppHandle) -> Result<(), String> {
    use std::sync::mpsc;
    use tauri_plugin_dialog::{DialogExt, FilePath};

    let (tx, rx) = mpsc::channel();

    app.dialog()
        .file()
        .pick_folder(move |path: Option<FilePath>| {
            tx.send(path).ok();
        });

    let dialog_result = tokio::task::spawn_blocking(move || rx.recv())
        .await
        .map_err(|e| format!("Task join error: {}", e))?
        .map_err(|e| format!("Dialog error: {}", e))?;

    if let Some(path) = dialog_result {
        // Update the log directory
        // This would need to be stored and passed to the watcher
        // For now, we'll just show a message
        if let Some(path_ref) = path.as_path() {
            app.emit("status-update", format!("Log path: {}", path_ref.display()))
                .map_err(|e| format!("Failed to emit event: {}", e))?;
        }
    }

    Ok(())
}
