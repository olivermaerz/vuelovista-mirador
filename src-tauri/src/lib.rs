use base64::{engine::general_purpose::STANDARD as BASE64, Engine as _};
use serde::Serialize;
use std::collections::HashMap;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct ProxyFetchResult {
  status: u16,
  headers: HashMap<String, String>,
  body_base64: String,
}

/// Allowed upstream hosts for chart/ADSB proxies (mirrors vite / serve.mjs).
fn host_allowed(url: &str) -> bool {
  match reqwest::Url::parse(url) {
    Ok(parsed) => matches!(
      parsed.host_str(),
      Some("api.adsb.lol")
        | Some("api.adsbdb.com")
        | Some("vrs-standing-data.adsb.lol")
        | Some("get.geojs.io")
    ),
    Err(_) => false,
  }
}

#[tauri::command]
async fn proxy_fetch(
  url: String,
  method: Option<String>,
  headers: Option<HashMap<String, String>>,
) -> Result<ProxyFetchResult, String> {
  if !host_allowed(&url) {
    return Err(format!("proxy_fetch: host not allowed for {url}"));
  }

  let client = reqwest::Client::new();
  let method_str = method.unwrap_or_else(|| "GET".into());
  let http_method =
    reqwest::Method::from_bytes(method_str.as_bytes()).map_err(|e| e.to_string())?;
  let mut req = client.request(http_method, &url);

  if let Some(hdrs) = headers {
    for (k, v) in hdrs {
      req = req.header(k, v);
    }
  }

  let response = req.send().await.map_err(|e| e.to_string())?;
  let status = response.status().as_u16();
  let mut out_headers = HashMap::new();
  for (k, v) in response.headers().iter() {
    if let Ok(val) = v.to_str() {
      out_headers.insert(k.to_string(), val.to_string());
    }
  }
  let bytes = response.bytes().await.map_err(|e| e.to_string())?;
  Ok(ProxyFetchResult {
    status,
    headers: out_headers,
    body_base64: BASE64.encode(bytes),
  })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_sql::Builder::default().build())
    .invoke_handler(tauri::generate_handler![proxy_fetch])
    .run(tauri::generate_context!())
    .expect("error while running Mirador");
}
