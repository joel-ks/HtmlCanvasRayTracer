mod shared_utils;
#[cfg(target_arch = "wasm32")] mod wasm_utils;
#[cfg(not(target_arch = "wasm32"))] mod native_utils;

pub use shared_utils::*;
#[cfg(target_arch = "wasm32")] pub use wasm_utils::*;
#[cfg(not(target_arch = "wasm32"))] pub use native_utils::*;

