import { Bus, Car, Route, TrainFront } from "lucide-react";

/**
 * Local-transport links for getting around during a stay. These point
 * at real, well-known booking platforms rather than a guessed deep
 * link per city, since exact transit-authority URLs go stale and are
 * hard to verify for every destination. The "Local transit" link is
 * the one link built per-destination, using Google's documented Maps
 * search URL scheme (always valid, never a guess).
 *
 * label/description are i18n keys (or, for localTransitDesc, resolved
 * with an interpolation var) — the component translates them so this
 * plain data function doesn't need to touch React/hooks.
 */
export function getTransportLinks(destination) {
  const transitQuery = encodeURIComponent(`public transport in ${destination}`);

  return [
    {
      key: "transit",
      icon: Bus,
      labelKey: "transport.localTransit",
      descKey: "transport.localTransitDesc",
      descVars: { destination },
      url: `https://www.google.com/maps/search/?api=1&query=${transitQuery}`,
    },
    {
      key: "bolt",
      icon: Route,
      label: "Bolt",
      descKey: "transport.boltDesc",
      url: "https://bolt.eu",
    },
    {
      key: "uber",
      icon: Route,
      label: "Uber",
      descKey: "transport.uberDesc",
      url: "https://www.uber.com",
    },
    {
      key: "intercity",
      icon: TrainFront,
      labelKey: "transport.intercity",
      descKey: "transport.intercityDesc",
      url: "https://www.flixbus.com",
    },
    {
      key: "car",
      icon: Car,
      labelKey: "transport.rentCar",
      descKey: "transport.rentCarDesc",
      url: "https://www.rentalcars.com",
    },
  ];
}
