pub use std::f64::INFINITY;
pub use std::f64::consts::PI;

pub fn degs_to_rads(degrees: f64) -> f64 {
    degrees * PI / 180.0
}

pub use web_sys::js_sys::Math::random;

pub fn range_random(min: f64, max: f64) -> f64 {
    (max - min) * random() + min
}
