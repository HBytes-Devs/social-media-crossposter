export const TOKEN_KEY = "smc_token";

export const DEFAULT_POST_OPTIONS = {
  languages: [
    { code: "en", label: "English" },
    { code: "zh", label: "Mandarin Chinese" },
    { code: "hi", label: "Hindi" },
    { code: "es", label: "Spanish" },
    { code: "fr", label: "French" },
    { code: "ar", label: "Arabic" },
    { code: "bn", label: "Bengali" },
    { code: "pt", label: "Portuguese" },
    { code: "ru", label: "Russian" },
    { code: "ur", label: "Urdu" },
    { code: "tr", label: "Turkish" },
    { code: "he", label: "Hebrew" },
    { code: "roman-ur", label: "Roman Urdu" },
  ],
  hashtagModes: [
    {
      value: "auto" as const,
      label: "Auto hashtags",
      description: "Generated from your content",
    },
    {
      value: "manual" as const,
      label: "Manual hashtags",
      description: "Use only your own tags",
    },
    {
      value: "none" as const,
      label: "No hashtags",
      description: "Post without any hashtags",
    },
  ],
  imageOptional: true,
};
