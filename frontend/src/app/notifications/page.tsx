import NotificationGenerator from "./notificationGenerator";
import MarkAllAsRead from "./markAllAsRead";

export default function Notifications() {
  return (
    <>
      <MarkAllAsRead />
      <div className="flex-col flex">
        <h3 className="mx-auto text-4xl mb-4 text-default border-links font-loves font-bold border-b-4">
          My Notifications
        </h3>
        <div className="mx-auto">
          <NotificationGenerator />
        </div>
      </div>
    </>
  );
}
