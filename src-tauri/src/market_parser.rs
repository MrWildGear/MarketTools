use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MarketData {
    pub item_name: String,
    pub type_id: i32,
    pub sell_price: f64,
    pub buy_price: f64,
    pub sell_order_count: usize,
    pub buy_order_count: usize,
    pub sell_price_95_ci: f64,
    pub buy_price_95_ci: f64,
}

const HUB_IDS: [f64; 5] = [60003760.0, 60004588.0, 60008494.0, 60011866.0, 60005686.0];
const HUB_IDS_SET: [f64; 5] = HUB_IDS;

pub enum OrderRange {
    Hub = 0,
    System = 1,
    OneJump = 2,
    TwoJump = 3,
    Region = 4,
}

impl From<u8> for OrderRange {
    fn from(value: u8) -> Self {
        match value {
            0 => OrderRange::Hub,
            1 => OrderRange::System,
            2 => OrderRange::OneJump,
            3 => OrderRange::TwoJump,
            _ => OrderRange::Region,
        }
    }
}

pub struct OrderRow {
    price: f64,
    is_buy_order: bool,
    location_id: f64,
    jumps: i32,
    type_id: i32,
}

fn parse_csv_row(row: &csv::StringRecord) -> Option<OrderRow> {
    if row.len() < 14 {
        return None;
    }

    // Skip header row if present (check if first column looks like a header)
    if let Some(first_col) = row.get(0) {
        let trimmed = first_col.trim();
        if trimmed.eq_ignore_ascii_case("price") || 
           trimmed.chars().next().map(|c| c.is_alphabetic()).unwrap_or(false) {
            return None;
        }
    }

    let price = row.get(0)?.parse::<f64>().ok()?;
    let is_buy_order = row.get(7)?.eq_ignore_ascii_case("true");
    let location_id = row.get(10)?.parse::<f64>().ok()?;
    let jumps = row.get(13)?.parse::<i32>().ok()?;
    let type_id = row.get(2)?.parse::<i32>().ok()?;

    Some(OrderRow {
        price,
        is_buy_order,
        location_id,
        jumps,
        type_id,
    })
}

fn filter_orders_by_range(
    orders: &[OrderRow],
    range: OrderRange,
    is_buy: bool,
) -> Vec<&OrderRow> {
    orders
        .iter()
        .filter(|order| {
            if order.is_buy_order != is_buy {
                return false;
            }

            match range {
                OrderRange::Hub => order.jumps == 0 && HUB_IDS_SET.iter().any(|&id| id == order.location_id),
                OrderRange::System => order.jumps == 0,
                OrderRange::OneJump => order.jumps < 2,
                OrderRange::TwoJump => order.jumps < 3,
                OrderRange::Region => true,
            }
        })
        .collect()
}

fn calculate_mean(prices: &[f64]) -> f64 {
    if prices.is_empty() {
        return 0.0;
    }
    prices.iter().sum::<f64>() / prices.len() as f64
}

fn calculate_std_dev(prices: &[f64], mean: f64) -> f64 {
    if prices.len() < 2 {
        return 0.0;
    }
    let variance = prices
        .iter()
        .map(|&price| (price - mean).powi(2))
        .sum::<f64>() / (prices.len() - 1) as f64;
    variance.sqrt()
}

fn calculate_95_ci_lower(prices: &[f64]) -> f64 {
    if prices.is_empty() {
        return -1.0;
    }
    if prices.len() == 1 {
        return prices[0];
    }
    let mean = calculate_mean(prices);
    let std_dev = calculate_std_dev(prices, mean);
    let n = prices.len() as f64;
    let standard_error = std_dev / n.sqrt();
    // Z-score for 95% confidence is 1.96
    let z_score = 1.96;
    mean - (z_score * standard_error)
}

fn calculate_95_ci_upper(prices: &[f64]) -> f64 {
    if prices.is_empty() {
        return -1.0;
    }
    if prices.len() == 1 {
        return prices[0];
    }
    let mean = calculate_mean(prices);
    let std_dev = calculate_std_dev(prices, mean);
    let n = prices.len() as f64;
    let standard_error = std_dev / n.sqrt();
    // Z-score for 95% confidence is 1.96
    let z_score = 1.96;
    mean + (z_score * standard_error)
}

pub fn parse_market_log(csv_content: &str, buy_range: u8, sell_range: u8) -> Option<MarketData> {
    let mut reader = csv::ReaderBuilder::new()
        .has_headers(false)
        .flexible(true)
        .from_reader(csv_content.as_bytes());

    let mut orders = Vec::new();
    let mut type_id = -1;
    let mut item_name = String::new();
    let mut total_rows = 0;
    let mut parsed_rows = 0;

    for result in reader.records() {
        total_rows += 1;
        if let Ok(record) = result {
            if let Some(order) = parse_csv_row(&record) {
                if type_id == -1 {
                    type_id = order.type_id;
                }
                orders.push(order);
                parsed_rows += 1;
            }
        }
    }

    eprintln!("CSV parsing: {} total rows, {} parsed orders", total_rows, parsed_rows);

    if orders.is_empty() {
        eprintln!("No orders parsed from CSV");
        return None;
    }

    // Extract item name from file path (would need to be passed separately)
    // For now, we'll set a placeholder
    if item_name.is_empty() {
        item_name = format!("Type ID {}", type_id);
    }

    let buy_range_enum: OrderRange = buy_range.into();
    let sell_range_enum: OrderRange = sell_range.into();

    let sell_orders = filter_orders_by_range(&orders, sell_range_enum, false);
    let buy_orders = filter_orders_by_range(&orders, buy_range_enum, true);

    let sell_price = sell_orders
        .iter()
        .map(|o| o.price)
        .min_by(|a, b| a.partial_cmp(b).unwrap())
        .unwrap_or(-1.0);

    let buy_price = buy_orders
        .iter()
        .map(|o| o.price)
        .max_by(|a, b| a.partial_cmp(b).unwrap())
        .unwrap_or(-1.0);

    // Calculate 95% confidence interval prices
    let sell_prices: Vec<f64> = sell_orders.iter().map(|o| o.price).collect();
    let buy_prices: Vec<f64> = buy_orders.iter().map(|o| o.price).collect();
    
    // For sell orders, use lower bound of CI (to avoid undercuts)
    let sell_price_95_ci = if sell_prices.is_empty() {
        -1.0
    } else {
        calculate_95_ci_lower(&sell_prices)
    };
    
    // For buy orders, use upper bound of CI (to avoid price hikes)
    let buy_price_95_ci = if buy_prices.is_empty() {
        -1.0
    } else {
        calculate_95_ci_upper(&buy_prices)
    };

    Some(MarketData {
        item_name,
        type_id,
        sell_price,
        buy_price,
        sell_order_count: sell_orders.len(),
        buy_order_count: buy_orders.len(),
        sell_price_95_ci,
        buy_price_95_ci,
    })
}

pub fn extract_item_name_from_filename(filename: &str) -> String {
    // Filename format: location-typeid-itemname.txt
    let parts: Vec<&str> = filename.split('-').collect();
    if parts.len() <= 2 {
        return "Unknown".to_string();
    }

    // Remove first (location) and last (typeid.txt) parts
    let name_parts = &parts[1..parts.len() - 1];
    let name = name_parts.join("-");

    if name.is_empty() {
        "Unknown".to_string()
    } else {
        name
    }
}
