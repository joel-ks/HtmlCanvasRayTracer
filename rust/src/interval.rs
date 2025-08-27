#[derive(Default, Clone, Copy)]
pub struct Interval {
    pub min: f64,
    pub max: f64
}

impl Interval {
    pub fn union(a: &Interval, b: &Interval)  -> Interval {
        // Create the interval tightly enclosing the two input intervals.
        Interval {
            min: if a.min <= b.min { a.min } else { b.min },
            max: if a.max >= b.max { a.max } else { b.max }
        }
    }

    pub fn surrounds(&self, value: f64) -> bool {
        self.min < value && value < self.max
    }

    pub fn clamp(&self, value: f64) -> f64 {
        if value < self.min {
            self.min
        } else if value > self.max {
            self.max
        } else {
            value
        }
    }
}

// pub static EMPTY: Interval = Interval {
//     min: std::f64::INFINITY,
//     max: std::f64::NEG_INFINITY
// };

// pub static UNIVERSE: Interval = Interval {
//     min: std::f64::NEG_INFINITY,
//     max: std::f64::INFINITY
// };
