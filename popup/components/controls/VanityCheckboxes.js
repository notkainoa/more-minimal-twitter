import { useEffect, useState } from "react";
import { KeyAllVanity, KeyFollowCount, KeyHideViewCount, KeyLikeCount, KeyReplyCount, KeyRetweetCount } from "../../../storage-keys";
import { getStorage, setStorage } from "../../utilities/chromeStorage";
import ToggleChevron from "../ui/ToggleChevron";
import { CheckboxControl } from "../ui/checkboxes";

// Checked = shown. Unchecking a box hides that engagement count.
const VanityCheckboxes = () => {
  const [showVanityCheckboxes, setShowVanityCheckboxes] = useState(false);
  const [showAll, setShowAll] = useState(true);
  const [showReply, setShowReply] = useState(true);
  const [showRetweet, setShowRetweet] = useState(true);
  const [showLike, setShowLike] = useState(true);
  const [showFollow, setShowFollow] = useState(true);
  const [showView, setShowView] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const userDefaultAll = await getStorage(KeyAllVanity);
        if (userDefaultAll !== undefined) setShowAll(userDefaultAll !== "hide");

        const userDefaultReply = await getStorage(KeyReplyCount);
        if (userDefaultReply !== undefined) setShowReply(userDefaultReply !== "hide");

        const userDefaultRetweet = await getStorage(KeyRetweetCount);
        if (userDefaultRetweet !== undefined) setShowRetweet(userDefaultRetweet !== "hide");

        const userDefaultLike = await getStorage(KeyLikeCount);
        if (userDefaultLike !== undefined) setShowLike(userDefaultLike !== "hide");

        const userDefaultFollow = await getStorage(KeyFollowCount);
        if (userDefaultFollow !== undefined) setShowFollow(userDefaultFollow !== "hide");

        const userDefaultView = await getStorage(KeyHideViewCount);
        if (userDefaultView !== undefined) setShowView(userDefaultView !== "on");
      } catch (error) {
        console.warn(error);
      }
    };

    load();
  }, []);

  const onCheckedChange = async (type, checked) => {
    const visibility = checked ? "show" : "hide";

    try {
      switch (type) {
        case "all":
          setShowAll(checked);
          setShowReply(checked);
          setShowRetweet(checked);
          setShowLike(checked);
          setShowFollow(checked);
          setShowView(checked);
          await setStorage({
            [KeyAllVanity]: visibility,
            [KeyReplyCount]: visibility,
            [KeyRetweetCount]: visibility,
            [KeyLikeCount]: visibility,
            [KeyFollowCount]: visibility,
            [KeyHideViewCount]: checked ? "off" : "on",
          });
          break;

        case "reply":
          setShowReply(checked);
          await setStorage({ [KeyReplyCount]: visibility });
          break;

        case "retweet":
          setShowRetweet(checked);
          await setStorage({ [KeyRetweetCount]: visibility });
          break;

        case "like":
          setShowLike(checked);
          await setStorage({ [KeyLikeCount]: visibility });
          break;

        case "follow":
          setShowFollow(checked);
          await setStorage({ [KeyFollowCount]: visibility });
          break;

        case "view":
          setShowView(checked);
          await setStorage({ [KeyHideViewCount]: checked ? "off" : "on" });
          break;
      }
    } catch (error) {
      console.warn(error);
    }
  };

  return (
    <>
      <CheckboxControl
        id="all"
        label="Engagements Under Posts"
        labelExtras={<ToggleChevron pressed={showVanityCheckboxes} onClick={setShowVanityCheckboxes} />}
        checked={showAll}
        onCheckedChange={(checked) => onCheckedChange("all", checked)}
      />
      {showVanityCheckboxes && (
        <div className="pl-3 flex flex-col gap-4 mb-2">
          <CheckboxControl id="reply" label="Reply Count from Tweets" onCheckedChange={(checked) => onCheckedChange("reply", checked)} checked={showReply} />
          <CheckboxControl id="retweet" label="Retweet Count from Tweets" onCheckedChange={(checked) => onCheckedChange("retweet", checked)} checked={showRetweet} />
          <CheckboxControl id="like" label="Like Count from Tweets" onCheckedChange={(checked) => onCheckedChange("like", checked)} checked={showLike} />
          <CheckboxControl id="follow" label="Follower/Following Count" onCheckedChange={(checked) => onCheckedChange("follow", checked)} checked={showFollow} />
          <CheckboxControl id="view" label="View Count from Tweets" onCheckedChange={(checked) => onCheckedChange("view", checked)} checked={showView} />
        </div>
      )}
    </>
  );
};

export default VanityCheckboxes;
