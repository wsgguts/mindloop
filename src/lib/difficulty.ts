// Tetos de esforço por capítulo (1–10), medidos em hipóteses de um passo ("E se…?") que o raciocínio precisa.
// Usados por scripts/tune_levels.ts (calibra os níveis) e pelos testes (garantem que a calibragem se mantém).
//  - Zip: solucionador por dedução de src/lib/zipLogic.ts. O teto sobe devagar até o capítulo final.
//  - Tango: as deduções das dicas do jogo; só os capítulos 7 e 10 pedem o "E se…?".
export const ZIP_CAP = [2, 3, 5, 5, 6, 7, 7, 8, 9, 10];
export const TANGO_CAP = [0, 0, 0, 0, 0, 0, 3, 0, 0, 5];
