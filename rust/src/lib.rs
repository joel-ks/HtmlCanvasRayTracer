mod colour;
mod utils;
mod vec3;

use colour::{Colour, Pixel};
use wasm_bindgen::prelude::*;

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
        let row_fraction = y as f64 / (self.height - 1) as f64;
        let col_fraction = x as f64 / (self.width - 1) as f64;
        let colour = Colour {
            x: col_fraction,
            y: row_fraction,
            z: 0.0
        };

        Pixel::from_colour(colour)
    }
}
