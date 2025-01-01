pub use std::f64::INFINITY;
pub use std::f64::consts::PI;

pub fn degs_to_rads(degrees: f64) -> f64 {
    degrees * PI / 180.0
}
