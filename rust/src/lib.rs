mod utils;

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct Pixel {
    pub r: u8,
    pub g: u8,
    pub b: u8,
    pub a: u8
}

#[wasm_bindgen]
impl Pixel {
    pub fn from_floats(r: f32, g: f32, b: f32, a: f32) -> Pixel {
        const SCALE: f32 = 255.0;
        
        return Pixel {
            r: (r * SCALE).floor() as u8,
            g: (g * SCALE).floor() as u8,
            b: (b * SCALE).floor() as u8,
            a: (a * SCALE).floor() as u8,
        };
    }

}

#[wasm_bindgen]
pub struct Renderer {
    width: u32,
    height: u32
}

#[wasm_bindgen]
impl Renderer {
    pub fn new(width: u32, height: u32) -> Renderer {
        utils::set_panic_hook();
        
        return Renderer {
            width, height
        }
    }

    pub fn render_pixel(&self, x: u32, y: u32) -> Pixel {
        let row_fraction = y as f32 / (self.height - 1) as f32;
        let col_fraction = x as f32 / (self.width - 1) as f32;

        Pixel::from_floats(col_fraction, row_fraction, col_fraction, 1.0)
    }
}
