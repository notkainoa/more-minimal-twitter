import {
  KeyHideComposer,
  KeyRemoveTimelineTabs,
  KeyStickyHeader,
  KeyTrendsHomeTimeline,
} from "../../../storage-keys";
import useMounted from "../../utilities/hooks/useMounted";
import TimelineWidthSlider from "../controls/TimelineWidthSlider";
import VanityCheckboxes from "../controls/VanityCheckboxes";
import ControlsWrapper from "../ui/ControlsWrapper";
import SectionLabel from "../ui/SectionLabel";
import Separator from "../ui/Separator";
import SwitchControl from "../ui/SwitchControl";
import { LocalStorageCheckboxControl } from "../ui/checkboxes";

const TimelineSection = () => {
  const mounted = useMounted();

  return (
    <section className="flex flex-col gap-y-2">
      <SectionLabel htmlFor="user-control-timeline">Timeline</SectionLabel>
      {mounted ? (
        <ControlsWrapper id="user-control-timeline">
          <TimelineWidthSlider />
          <Separator />
          <SwitchControl label="Sticky Header" storageKey={KeyStickyHeader} />
          <SwitchControl label="Trends on Home Timeline" storageKey={KeyTrendsHomeTimeline} />
          <VanityCheckboxes />
          <LocalStorageCheckboxControl label={`Hide Timeline Tabs (For you, Following, lists...)`} storageKey={KeyRemoveTimelineTabs} crossedIcon />
          <SwitchControl label="Hide Post Composer" storageKey={KeyHideComposer} />
        </ControlsWrapper>
      ) : (
        <ControlsWrapper className="animate-pulse h-[115.5px]" />
      )}
      <p className="pt-1 pb-2 text-xs text-center font-medium leading-5 dark:text-x-accentDark text-x-accent1">
        View more 𝕏 display settings{" "}
        <a href="https://twitter.com/i/display" target="_blank" rel="noreferrer" className="text-x-premium hover:underline">
          here
        </a>
        .
      </p>
    </section>
  );
};

export default TimelineSection;
