"use client";

import { useState, useTransition } from "react";
import type { ProfileTemplate } from "@/lib/profile-template";
import { resetProfileConfig, saveProfileConfig } from "@/app/actions/profile";
import { ToggleRow } from "@/components/forms/ToggleRow";
import { SaveBar } from "@/components/forms/SaveBar";

export function OptionsEditor({ initial }: { initial: ProfileTemplate }) {
  const [options, setOptions] = useState(initial.options);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function set<K extends keyof typeof options>(key: K, value: (typeof options)[K]) {
    setOptions((o) => ({ ...o, [key]: value }));
  }

  return (
    <div>
      <p className="help mb-2">
        Choose what visitors can see. These toggles only affect the public page.
      </p>
      <ToggleRow
        title="Theme on icons"
        description="Tint social icons with your theme color / brand colors."
        checked={options.showThemeOnIcons}
        onChange={(v) => set("showThemeOnIcons", v)}
      />
      <ToggleRow
        title="Total views"
        description="Show real view count on your banner."
        checked={options.showViews}
        onChange={(v) => set("showViews", v)}
      />
      <ToggleRow
        title="UID"
        description="Show your unique under.bio number."
        checked={options.showUid}
        onChange={(v) => set("showUid", v)}
      />
      <ToggleRow
        title="Discord presence card"
        description="Show the mini status strip under your profile."
        checked={options.showDiscordPresence}
        onChange={(v) => set("showDiscordPresence", v)}
      />
      <ToggleRow
        title="Join date"
        description="Show when you joined under.bio."
        checked={options.showJoinDate}
        onChange={(v) => set("showJoinDate", v)}
      />
      <ToggleRow
        title="Location"
        description="Show location if you set one in Identity."
        checked={options.showLocation}
        onChange={(v) => set("showLocation", v)}
      />
      <ToggleRow
        title="Tags"
        description="Show your tags on the public page."
        checked={options.showTags}
        onChange={(v) => set("showTags", v)}
      />
      <ToggleRow
        title="Social icons"
        description="Show your social icon row (Discord, OnlyFans, Steam, etc.)."
        checked={options.showSocialIcons}
        onChange={(v) => set("showSocialIcons", v)}
      />
      <ToggleRow
        title="under badge"
        description="Small under mark on the presence strip."
        checked={options.showUnderBadge}
        onChange={(v) => set("showUnderBadge", v)}
      />
      <ToggleRow
        title="Badge shelf"
        description="Show the icon badge row under your name."
        checked={options.showBadges}
        onChange={(v) => set("showBadges", v)}
      />
      <ToggleRow
        title="View rank"
        description="Show real rank badge from total views across under.bio."
        checked={options.showRank}
        onChange={(v) => set("showRank", v)}
      />
      <ToggleRow
        title="Verified mark"
        description="Show the blue verified badge when applicable."
        checked={options.showVerified}
        onChange={(v) => set("showVerified", v)}
      />
      <ToggleRow
        title="Owner badge"
        description="Show Owner mark if you are the site owner."
        checked={options.showOwnerBadge}
        onChange={(v) => set("showOwnerBadge", v)}
      />
      <ToggleRow
        title="Online status dot"
        description="Green/custom status dot on the presence strip."
        checked={options.showStatusDot}
        onChange={(v) => set("showStatusDot", v)}
      />
      <ToggleRow
        title="Bio text"
        description="Show your description block."
        checked={options.showBio}
        onChange={(v) => set("showBio", v)}
      />
      <ToggleRow
        title="Music player"
        description="Show the track player when a track is set."
        checked={options.showMusic}
        onChange={(v) => set("showMusic", v)}
      />
      <ToggleRow
        title="Corner accents"
        description="Thin L-shaped corners on the main card."
        checked={options.showCornerAccents}
        onChange={(v) => set("showCornerAccents", v)}
      />
      <ToggleRow
        title="Reveal screen"
        description="Require a click before showing your page."
        checked={options.showRevealScreen}
        onChange={(v) => set("showRevealScreen", v)}
      />

      <SaveBar
        saving={pending}
        message={message}
        onSave={() =>
          startTransition(async () => {
            const res = await saveProfileConfig({ options });
            setMessage(res.ok ? res.message || "Saved." : res.error || "Failed.");
          })
        }
        onReset={() =>
          startTransition(async () => {
            const res = await resetProfileConfig();
            setMessage(res.ok ? res.message || "Reset." : res.error || "Failed.");
          })
        }
      />
    </div>
  );
}
