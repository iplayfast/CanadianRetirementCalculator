// Provincial tax rates for 2025
export const PROVINCIAL_TAX_RATES: Record<string, { name: string, brackets: { threshold: number, rate: number }[] }> = {
  AB: {
    name: "Alberta",
    brackets: [
      { threshold: 0, rate: 0.10 },
      { threshold: 142292, rate: 0.12 },
      { threshold: 170751, rate: 0.13 },
      { threshold: 227668, rate: 0.14 },
      { threshold: 341502, rate: 0.15 }
    ]
  },
  BC: {
    name: "British Columbia",
    brackets: [
      { threshold: 0, rate: 0.0506 },
      { threshold: 45654, rate: 0.077 },
      { threshold: 91310, rate: 0.105 },
      { threshold: 104835, rate: 0.1229 },
      { threshold: 127299, rate: 0.147 },
      { threshold: 172602, rate: 0.168 },
      { threshold: 240716, rate: 0.205 }
    ]
  },
  MB: {
    name: "Manitoba",
    brackets: [
      { threshold: 0, rate: 0.108 },
      { threshold: 36842, rate: 0.1275 },
      { threshold: 79625, rate: 0.174 }
    ]
  },
  NB: {
    name: "New Brunswick",
    brackets: [
      { threshold: 0, rate: 0.094 },
      { threshold: 47715, rate: 0.14 },
      { threshold: 95431, rate: 0.16 },
      { threshold: 176756, rate: 0.195 }
    ]
  },
  NL: {
    name: "Newfoundland and Labrador",
    brackets: [
      { threshold: 0, rate: 0.087 },
      { threshold: 41457, rate: 0.145 },
      { threshold: 82913, rate: 0.158 },
      { threshold: 148027, rate: 0.178 },
      { threshold: 207239, rate: 0.198 },
      { threshold: 264750, rate: 0.208 },
      { threshold: 529499, rate: 0.218 },
      { threshold: 1059000, rate: 0.228 }
    ]
  },
  NT: {
    name: "Northwest Territories",
    brackets: [
      { threshold: 0, rate: 0.059 },
      { threshold: 48326, rate: 0.086 },
      { threshold: 96655, rate: 0.122 },
      { threshold: 157139, rate: 0.1405 }
    ]
  },
  NS: {
    name: "Nova Scotia",
    brackets: [
      { threshold: 0, rate: 0.0879 },
      { threshold: 29590, rate: 0.1495 },
      { threshold: 59180, rate: 0.1667 },
      { threshold: 93000, rate: 0.175 },
      { threshold: 150000, rate: 0.21 }
    ]
  },
  NU: {
    name: "Nunavut",
    brackets: [
      { threshold: 0, rate: 0.04 },
      { threshold: 50877, rate: 0.07 },
      { threshold: 101754, rate: 0.09 },
      { threshold: 165429, rate: 0.115 }
    ]
  },
  ON: {
    name: "Ontario",
    brackets: [
      { threshold: 0, rate: 0.0505 },
      { threshold: 52886, rate: 0.0915 },
      { threshold: 105775, rate: 0.1116 },
      { threshold: 150000, rate: 0.1216 },
      { threshold: 220000, rate: 0.1316 }
    ]
  },
  PE: {
    name: "Prince Edward Island",
    brackets: [
      { threshold: 0, rate: 0.098 },
      { threshold: 32656, rate: 0.138 },
      { threshold: 65315, rate: 0.167 }
    ]
  },
  QC: {
    name: "Quebec",
    brackets: [
      { threshold: 0, rate: 0.15 },
      { threshold: 49275, rate: 0.20 },
      { threshold: 98540, rate: 0.24 },
      { threshold: 119910, rate: 0.2575 }
    ]
  },
  SK: {
    name: "Saskatchewan",
    brackets: [
      { threshold: 0, rate: 0.105 },
      { threshold: 49720, rate: 0.125 },
      { threshold: 142058, rate: 0.145 }
    ]
  },
  YT: {
    name: "Yukon",
    brackets: [
      { threshold: 0, rate: 0.064 },
      { threshold: 53359, rate: 0.09 },
      { threshold: 106717, rate: 0.109 },
      { threshold: 165430, rate: 0.128 },
      { threshold: 500000, rate: 0.15 }
    ]
  }
};

// Array of provinces for dropdown selection
export const PROVINCES = Object.entries(PROVINCIAL_TAX_RATES).map(([code, data]) => ({
  code,
  name: data.name
}));
