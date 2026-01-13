use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppSettings {
    pub selected_profile: String,
    pub auto_copy_enabled: bool,
    pub auto_copy_mode: String, // "sell" | "buy" | "sell95" | "buy95"
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub window_x: Option<i32>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub window_y: Option<i32>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub window_width: Option<u32>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub window_height: Option<u32>,
}

impl AppSettings {
    pub fn default() -> Self {
        AppSettings {
            selected_profile: "Default".to_string(),
            auto_copy_enabled: false,
            auto_copy_mode: "sell".to_string(),
            window_x: None,
            window_y: None,
            window_width: None,
            window_height: None,
        }
    }

    pub fn get_settings_path(app_data_dir: &PathBuf) -> PathBuf {
        let mut path = app_data_dir.clone();
        path.push("settings.json");
        path
    }

    pub fn save(&self, app_data_dir: &PathBuf) -> anyhow::Result<()> {
        let path = Self::get_settings_path(app_data_dir);
        let json = serde_json::to_string_pretty(self)?;
        fs::write(path, json)?;
        Ok(())
    }

    pub fn load(app_data_dir: &PathBuf) -> anyhow::Result<Self> {
        let path = Self::get_settings_path(app_data_dir);
        if !path.exists() {
            return Ok(Self::default());
        }

        let content = fs::read_to_string(path)?;
        let settings: AppSettings = serde_json::from_str(&content)?;
        Ok(settings)
    }
}
