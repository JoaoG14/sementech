export interface Seed {
  id: string;
  img: string;
  name: string;
  germination_rate: string;
  seed_count: string;
  origin: string;
  season: string;
  url: string;
  description: string;
  planting_depth: string;
  spacing: string;
  sun_exposure: string;
  watering: string;
  days_to_germination: string;
  days_to_harvest: string;
  height: string;
  soil_type: string;
  companion_plants: string[];
}

export const seeds: Seed[] = [
  {
    id: "001",
    img: "https://cdn.awsli.com.br/600x450/2195/2195322/produto/156269308/19ab542e3b.jpg",
    name: "Semente de Girassol",
    germination_rate: "90%",
    seed_count: "30",
    origin: "Brasil",
    season: "Primavera/Verão",
    url: "https://example.com/girassol-ornamental",
    description:
      "O girassol é uma planta anual conhecida por suas flores grandes e vistosas que seguem o movimento do sol. Além de seu valor ornamental, suas sementes são ricas em óleos e nutrientes, sendo utilizadas tanto para consumo humano quanto para produção de óleo vegetal.",
    planting_depth: "2-3 cm",
    spacing: "30-45 cm",
    sun_exposure: "Sol pleno (6-8 horas diárias)",
    watering: "Regular, mantendo o solo úmido mas não encharcado",
    days_to_germination: "7-10 dias",
    days_to_harvest: "80-120 dias",
    height: "1.5-3 metros",
    soil_type: "Bem drenado, rico em matéria orgânica",
    companion_plants: ["Pepino", "Milho", "Feijão"],
  },
];
