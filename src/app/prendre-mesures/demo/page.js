import MeasurementEditor from "@/components/measurements/MeasurementEditor";

export const metadata = {
  title: "Démonstration des mesures | Vosthermos",
  robots: "noindex, nofollow, noarchive",
  referrer: "no-referrer",
};

const DEMO_MEASUREMENT = {
  id: "demo",
  source: "client",
  accuracy: "client",
  status: "in_progress",
  data: {
    version: 1,
    locale: "fr",
    displayUnit: "in",
    notes: "",
    windows: [{
      id: "demo-window-1",
      number: 1,
      label: "Salon",
      location: "",
      photoUrl: null,
      viewSide: "inside",
      layoutPreset: "2x2",
      frame: { widthSixteenths: null, heightSixteenths: null },
      panes: [
        { id: "demo-pane-1", number: 1, x: 0, y: 0, width: 5000, height: 5000 },
        { id: "demo-pane-2", number: 2, x: 5000, y: 0, width: 5000, height: 5000 },
        { id: "demo-pane-3", number: 3, x: 0, y: 5000, width: 5000, height: 5000 },
        { id: "demo-pane-4", number: 4, x: 5000, y: 5000, width: 5000, height: 5000 },
      ],
    }],
  },
};

export default async function MeasurementDemoPage({ searchParams }) {
  const query = await searchParams;
  const language = String(query?.lang || "fr").toLowerCase().startsWith("en") ? "en" : "fr";
  return <MeasurementEditor initialMeasurement={DEMO_MEASUREMENT} publicMode demoMode language={language} />;
}
