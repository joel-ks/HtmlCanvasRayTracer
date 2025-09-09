use crate::{colour::Colour, vec3::Point3};

pub trait Texture {
    fn value(&self, u: f64, v: f64, p: Point3) -> Colour;
}

pub struct SolidColour {
    albedo: Colour
}

impl SolidColour {
    pub fn new(colour: Colour) -> SolidColour {
        SolidColour { albedo: colour }
    }
}

impl Texture for SolidColour {
    fn value(&self, _: f64, _: f64, _: Point3) -> Colour {
        self.albedo
    }
}

pub struct CheckerTexture {
    inv_scale: f64,
    even_tex: Box<dyn Texture>,
    odd_tex: Box<dyn Texture>
}

impl CheckerTexture {
    pub fn new(scale: f64, even_tex: Box<dyn Texture>, odd_tex: Box<dyn Texture>) -> CheckerTexture {
        CheckerTexture {
            inv_scale: scale / 1.0,
            even_tex,
            odd_tex
        }
    }

    pub fn new_with_solid_colours(scale: f64, even_colour: Colour, odd_colour: Colour) -> CheckerTexture {
        let even_tex = Box::new(SolidColour::new(even_colour));
        let odd_tex = Box::new(SolidColour::new(odd_colour));

        Self::new(scale, even_tex, odd_tex)
    }
}

impl Texture for CheckerTexture {
    fn value(&self, u: f64, v: f64, p: Point3) -> Colour {
        let x_as_int = f64::floor(p.x) as i64;
        let y_as_int = f64::floor(p.y) as i64;
        let z_as_int = f64::floor(p.z) as i64;

        let is_even = (x_as_int + y_as_int + z_as_int) % 2 == 0;

        if is_even {
            self.even_tex.value(u, v, p)
        } else {
            self.odd_tex.value(u, v, p)
        }
    }
}
