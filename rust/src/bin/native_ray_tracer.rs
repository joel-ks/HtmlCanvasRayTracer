use std::{io::{BufWriter, Write}, time::SystemTime};

use wasm_ray_tracer::Renderer;

const WIDTH: u32 = 1280;
const HEIGHT: u32 = 720;

#[cfg(not(target_arch = "wasm32"))]
fn main() {
    eprint!("Building scene...");
    let renderer = Renderer::new(WIDTH, HEIGHT);
    eprintln!(" complete.");

    let out = std::io::stdout();
    let mut writer = BufWriter::new(out);

    writer.write_all(format!("P3\n{WIDTH} {HEIGHT}\n255\n").as_bytes()).unwrap();

    eprintln!("Rendering...");
    let start = SystemTime::now();
    for y in 0..HEIGHT {
        for x in 0..WIDTH {
            let pixel = renderer.render_pixel(x, y);
            let r = pixel.r;
            let g = pixel.g;
            let b = pixel.b;
            writer.write_all(format!("{r} {g} {b}\n").as_bytes()).unwrap();
        }

        let percent_complete = ((y+1) * WIDTH) as f64 / (WIDTH * HEIGHT) as f64 * 100.0;
        eprint!("\rProgress: {percent_complete:.2}%...");
    }
    let total_ms = SystemTime::now().duration_since(start).unwrap().as_millis();

    eprintln!();
    eprintln!("Completed in {total_ms}ms.");
}

#[ cfg( target_arch = "wasm32" ) ]
fn main(){}
