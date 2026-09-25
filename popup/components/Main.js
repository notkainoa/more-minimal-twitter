import AdvancedSection from "./sections/AdvancedSection";
import ExtensionStatus from "./sections/ExtensionStatus";
import InterfaceSection from "./sections/InterfaceSection";
import NavigationSection from "./sections/NavigationSection";
import RightSideSection from "./sections/RightSideSection";
import TimelineSection from "./sections/TimelineSection";

const Main = () => (
  <main className="flex flex-col p-2 gap-y-4">
    <ExtensionStatus />
    <TimelineSection />
    <NavigationSection />
    <RightSideSection />
    <InterfaceSection />
    <AdvancedSection />
  </main>
);

export default Main;
