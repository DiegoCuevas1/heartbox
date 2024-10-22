import NotificationGenerator from "./notificationGenerator";

export default function Notifications() {
  return (
    <>
      <div className="flex-col flex">
        <h2 className="mx-auto mt-2 mb-2 text-4xl text-[#0c0c0c] border-[#D31C5F] font-loves font-bold border-b-4">
          My Notifications
        </h2>
        <NotificationGenerator />
      </div>
    </>
  );
}
