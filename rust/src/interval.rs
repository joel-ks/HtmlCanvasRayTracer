pub struct Interval {
    pub min: f64,
    pub max: f64
}

impl Interval {
    pub fn empty() -> Interval {
        Interval {
            min: std::f64::INFINITY,
            max: std::f64::NEG_INFINITY
        }
    }

    pub fn size(&self) -> f64 {
        self.max - self.min
    }

    pub fn contains(&self, value: f64) -> bool {
        self.min <= value && value <= self.max
    }

    pub fn surrounds(&self, value: f64) -> bool {
        self.min < value && value < self.max
    }
}

pub static EMPTY: Interval = Interval {
    min: std::f64::INFINITY,
    max: std::f64::NEG_INFINITY
};

pub static UNIVERSE: Interval = Interval {
    min: std::f64::NEG_INFINITY,
    max: std::f64::INFINITY
};
