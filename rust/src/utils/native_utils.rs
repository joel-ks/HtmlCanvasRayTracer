pub fn random() -> f64 {
    rand::random::<f64>()
}

pub fn range_random_i32(min: i32, max: i32) -> i32 {
    use rand::{rngs::StdRng, RngExt};
    let mut rng = rand::make_rng::<StdRng>();
    rng.random_range(min..max)
}

pub fn range_random_f64(min: f64, max: f64) -> f64 {
    use rand::{rngs::StdRng, RngExt};
    let mut rng = rand::make_rng::<StdRng>();
    rng.random_range(min..max)
}
