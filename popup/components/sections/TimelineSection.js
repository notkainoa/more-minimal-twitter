import {
  KeyHideComposer,
  KeyRemoveTimelineTabs,
  KeyStickyHeader,
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
          <VanityCheckboxes />
          <LocalStorageCheckboxControl label={`Hide Timeline Tabs (For you, Following, lists...)`} storageKey={KeyRemoveTimelineTabs} crossedIcon />
          <SwitchControl label="Hide Post Composer" storageKey={KeyHideComposer} />
        </ControlsWrapper>
      ) : (
        <ControlsWrapper className="animate-pulse h-[115.5px]" />
      )}
    </section>
  );
};

export default TimelineSection;
