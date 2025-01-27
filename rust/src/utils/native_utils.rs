pub fn random() -> f64 {
    rand::random::<f64>()
}

pub fn range_random(min: f64, max: f64) -> f64 {
    use rand::Rng;
    let mut rng = rand::thread_rng();
    rng.gen_range(min..max)
}
