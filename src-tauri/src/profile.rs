use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Profile {
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

impl Profile {
    pub fn default(profile_name: String) -> Self {
        Profile {
            char_id: 0,
            profile_name,
            margin_threshold: 0.1,
            minimum_threshold: 0.02,
            accounting: 5,
            broker_relations: 5,
            faction_standing: 0.0,
            corp_standing: 0.0,
            use_buy_custom_broker: false,
            buy_custom_broker: 0.01,
            use_sell_custom_broker: false,
            sell_custom_broker: 0.01,
            buy_range: 0, // HUB
            sell_range: 0, // HUB
        }
    }

    pub fn get_profile_path(profiles_dir: &PathBuf, profile_name: &str) -> PathBuf {
        let mut path = profiles_dir.clone();
        path.push("profiles");
        path.push(format!("{}.json", profile_name));
        path
    }

    pub fn save(&self, profiles_dir: &PathBuf) -> anyhow::Result<()> {
        if self.profile_name == "Default" {
            return Ok(()); // Don't save Default profile
        }

        let path = Self::get_profile_path(profiles_dir, &self.profile_name);
        let json = serde_json::to_string_pretty(self)?;
        fs::write(path, json)?;
        Ok(())
    }

    pub fn load(profiles_dir: &PathBuf, profile_name: &str) -> anyhow::Result<Self> {
        let path = Self::get_profile_path(profiles_dir, profile_name);
        if !path.exists() {
            return Ok(Self::default(profile_name.to_string()));
        }

        let content = fs::read_to_string(path)?;
        let profile: Profile = serde_json::from_str(&content)?;
        Ok(profile)
    }

    pub fn list_all(profiles_dir: &PathBuf) -> anyhow::Result<Vec<String>> {
        let mut profiles = vec!["Default".to_string()];
        let profiles_path = profiles_dir.join("profiles");

        if profiles_path.exists() {
            let entries = fs::read_dir(profiles_path)?;
            for entry in entries {
                let entry = entry?;
                let path = entry.path();
                if let Some(ext) = path.extension() {
                    if ext == "json" {
                        if let Some(stem) = path.file_stem() {
                            if let Some(name) = stem.to_str() {
                                if name != "Default" {
                                    profiles.push(name.to_string());
                                }
                            }
                        }
                    }
                }
            }
        }

        Ok(profiles)
    }

    pub fn delete(profiles_dir: &PathBuf, profile_name: &str) -> anyhow::Result<()> {
        if profile_name == "Default" {
            return Err(anyhow::anyhow!("Cannot delete Default profile"));
        }

        let path = Self::get_profile_path(profiles_dir, profile_name);
        if path.exists() {
            fs::remove_file(path)?;
        }
        Ok(())
    }
}
