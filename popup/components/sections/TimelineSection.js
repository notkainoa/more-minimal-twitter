import {
  KeyHideComposer,
  KeyRemoveTimelineTabs,
  KeyStickyHeader,
} from "../../../storage-keys";
import useMounted from "../../utilities/hooks/useMounted";
import useStorageKeyState from "../../utilities/useStorageKeyState";
import TimelineWidthSlider from "../controls/TimelineWidthSlider";
import VanityCheckboxes from "../controls/VanityCheckboxes";
import ControlsWrapper from "../ui/ControlsWrapper";
import SectionLabel from "../ui/SectionLabel";
import Separator from "../ui/Separator";
import SwitchControl from "../ui/SwitchControl";
import { CheckboxControl } from "../ui/checkboxes";

// Checked = shown, unchecked = hidden. Both keys store "on" = hidden and
// "off" = shown, so the boolean state is inverted here.
const ShowCheckboxControl = ({ label, storageKey }) => {
  const [hidden, setHidden] = useStorageKeyState(storageKey);

  return <CheckboxControl id={storageKey} label={label} checked={!hidden} onCheckedChange={(checked) => setHidden(!checked)} />;
};

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
          <ShowCheckboxControl label={`Timeline Tabs (For you, Following, lists...)`} storageKey={KeyRemoveTimelineTabs} />
          <ShowCheckboxControl label="Post Composer" storageKey={KeyHideComposer} />
        </ControlsWrapper>
      ) : (
        <ControlsWrapper className="animate-pulse h-[115.5px]" />
      )}
    </section>
  );
};

export default TimelineSection;
