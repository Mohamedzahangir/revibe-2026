import eventData from "../data/eventData";
import { paymentData } from "../data/registrationData";
import logoWhite from "../assets/logos/logo-white.png";

const preloadedImages = new Map();

export function preloadImage(src) {
  if (!src || preloadedImages.has(src)) {
    return preloadedImages.get(src);
  }

  const image = new Image();
  image.decoding = "async";
  image.fetchPriority = "low";
  image.src = src;
  preloadedImages.set(src, image);

  return image;
}

export function preloadImages(sources) {
  return sources.filter(Boolean).map(preloadImage);
}

export function preloadCriticalImages() {
  preloadImages([
    logoWhite,
    ...eventData.map((event) => event.chibi),
    paymentData.qrImage,
    "/Reg cards/regcardName.png",
    "/Reg cards/regcardTeamname.png",
    "/Upi logos/upi-payment-icon.svg",
    "/Upi logos/google-pay-icon.svg",
    "/Upi logos/phonepe-icon.svg",
    "/Upi logos/bhim-app-icon.svg",
    "/Upi logos/navi-team.png",
  ]);
}
