use crate::{interval::Interval, vec3::Vec3};
use wasm_bindgen::prelude::wasm_bindgen;

pub type Colour = Vec3;

#[wasm_bindgen]
pub struct Pixel {
    pub r: u8,
    pub g: u8,
    pub b: u8,
    pub a: u8
}

impl Pixel {
    pub fn from_f64s(r: f64, g: f64, b: f64, a: f64) -> Pixel {
        const MAX_U8: f64 = 255.0;
        static INTENSITY: Interval = Interval {
            min: 0.0,
            max: 1.0 - f64::EPSILON
        };
        
        Pixel {
            r: (INTENSITY.clamp(r) * MAX_U8).floor() as u8,
            g: (INTENSITY.clamp(g) * MAX_U8).floor() as u8,
            b: (INTENSITY.clamp(b) * MAX_U8).floor() as u8,
            a: (INTENSITY.clamp(a) * MAX_U8).floor() as u8,
        }
    }

    pub fn from_colour(colour: Colour) -> Pixel {
        Pixel::from_f64s(colour.x, colour.y, colour.z, 1.0)
    }
}
