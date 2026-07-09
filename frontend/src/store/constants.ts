export const TOKEN_KEY = "smc_token";

export const DEFAULT_POST_OPTIONS = {
  languages: [
    { code: "en", label: "English" },
    { code: "ur", label: "Urdu" },
    { code: "roman-ur", label: "Roman Urdu" },
    { code: "hi", label: "Hindi" },
    { code: "ar", label: "Arabic" },
  ],
  hashtagModes: [
    {
      value: "auto" as const,
      label: "Auto hashtags",
      description: "Content se hashtags auto generate honge",
    },
    {
      value: "manual" as const,
      label: "Manual hashtags",
      description: "Sirf aapke diye hue hashtags use honge",
    },
    {
      value: "none" as const,
      label: "No hashtags",
      description: "Post bina hashtags ke jayegi",
    },
  ],
  imageOptional: true,
};
