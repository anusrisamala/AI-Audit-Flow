// import { useNavigate } from "react-router-dom";
// import { LogOut, Bell } from "lucide-react";
// import { useAuth } from "../context/AuthContext";
// import { useState, useRef, useEffect } from "react";

// export function Header({ title }: { title: string }) {
//   const { logout } = useAuth();
//   const navigate = useNavigate();
//   const [openNotifications, setOpenNotifications] = useState(false);
//   const dropdownRef = useRef<HTMLDivElement>(null);
//   const [notifications, setNotifications] = useState([
//     {
//       id: 1,
//       title: "Audit overdue",
//       message: "IT Infrastructure Audit is overdue",
//       unread: true,
//     },
//     {
//       id: 2,
//       title: "Report generated",
//       message: "Operations Audit report is ready",
//       unread: true,
//     },
//   ]);
//   const unreadCount = notifications.filter((n) => n.unread).length;

//   useEffect(() => {
//     function handleClickOutside(event: MouseEvent) {
//       if (
//         dropdownRef.current &&
//         !dropdownRef.current.contains(event.target as Node)
//       ) {
//         setOpenNotifications(false);
//       }
//     }

//     document.addEventListener("mousedown", handleClickOutside);

//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);
//   const handleLogout = () => {
//     logout();
//     navigate("/login");
//   };

//   return (
//     <div className="h-16 bg-white border-b border-[#DEDEDE] fixed top-0 right-0 left-64 flex items-center justify-between px-8 z-10">
//       <h2 className="text-2xl font-bold text-[#333333]">{title}</h2>

//       <div className="flex items-center gap-4">
//         <div className="relative" ref={dropdownRef}>
//           <button
//             onClick={() => setOpenNotifications(!openNotifications)}
//             className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
//           >
//             <Bell size={20} className="text-gray-600" />
//             {unreadCount > 0 && (
//               <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#EB8C00] text-white text-[10px] font-semibold flex items-center justify-center">
//                 {unreadCount}
//               </span>
//             )}
//           </button>
//           {openNotifications && (
//             <div className="absolute right-0 mt-2 w-80 bg-white border border-[#DEDEDE] rounded-lg shadow-lg z-50">
//               <div className="p-4 border-b border-[#DEDEDE] flex items-center justify-between">
//                 <p className="font-semibold">Notifications</p>

//                 {unreadCount > 0 && (
//                   <button
//                     onClick={() => {
//                       setNotifications((prev) =>
//                         prev.map((item) => ({ ...item, unread: false })),
//                       );
//                     }}
//                     className="text-sm text-[#EB8C00]"
//                   >
//                     Mark all as read
//                   </button>
//                 )}
//               </div>

//               {notifications.map((n) => (
//                 <div
//                   key={n.id}
//                   className={`p-4 border-b border-gray-100 ${
//                     n.unread ? "bg-orange-50" : "bg-white"
//                   }`}
//                 >
//                   <p className="font-medium text-sm">{n.title}</p>

//                   <p className="text-sm text-gray-600 mt-1">{n.message}</p>

//                   {n.unread && (
//                     <button
//                       onClick={() => {
//                         setNotifications((prev) =>
//                           prev.map((item) =>
//                             item.id === n.id
//                               ? { ...item, unread: false }
//                               : item,
//                           ),
//                         );
//                       }}
//                       className="text-sm text-[#EB8C00] mt-2"
//                     >
//                       Mark as read
//                     </button>
//                   )}
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         <button
//           onClick={handleLogout}
//           className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
//         >
//           <LogOut size={18} />
//           <span>Logout</span>
//         </button>
//       </div>
//     </div>
//   );
// }
import { useNavigate } from "react-router-dom";
import { LogOut, Bell } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useState, useRef, useEffect } from "react";
import { notificationService, Notification } from "../services/notificationService";


export function Header({ title }: { title: string }) {

  const { logout } = useAuth();
  const navigate = useNavigate();

  const [openNotifications, setOpenNotifications] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);


  const [notifications, setNotifications] = useState<Notification[]>([]);


  const unreadCount = notifications.filter(
    (n) => !n.is_read
  ).length;



  const loadNotifications = async () => {

    try {

      const data = await notificationService.getAll();

      setNotifications(data);


    } catch(error) {

      console.error(
        "Failed to load notifications",
        error
      );

    }

  };



  useEffect(() => {

    loadNotifications();


    // refresh notifications every 30 seconds
    const interval = setInterval(() => {

      loadNotifications();

    },30000);


    return () => clearInterval(interval);


  }, []);




  useEffect(() => {

    function handleClickOutside(event: MouseEvent) {

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {

        setOpenNotifications(false);

      }

    }


    document.addEventListener(
      "mousedown",
      handleClickOutside
    );


    return () => {

      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );

    };


  }, []);




  const handleMarkRead = async(id:number)=>{

    try{

      await notificationService.markRead(id);


      setNotifications(prev =>
  prev.filter(item => item.id !== id)
);


    }catch(error){

      console.error(error);

    }

  };




  const handleMarkAllRead = async()=>{

    try{

      await notificationService.markAllRead();


      setNotifications([]);


    }catch(error){

      console.error(error);

    }

  };





  const handleLogout = () => {

    logout();

    navigate("/login");

  };



  return (

    <div className="h-16 bg-white border-b border-[#DEDEDE] fixed top-0 right-0 left-64 flex items-center justify-between px-8 z-10">


      <h2 className="text-2xl font-bold text-[#333333]">
        {title}
      </h2>



      <div className="flex items-center gap-4">


        <div
          className="relative"
          ref={dropdownRef}
        >


          <button
            onClick={() =>
              setOpenNotifications(!openNotifications)
            }
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
          >

            <Bell
              size={20}
              className="text-gray-600"
            />


            {
              unreadCount > 0 && (

                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#EB8C00] text-white text-[10px] font-semibold flex items-center justify-center">

                  {unreadCount}

                </span>

              )
            }


          </button>




          {
            openNotifications && (

              <div className="absolute right-0 mt-2 w-80 bg-white border border-[#DEDEDE] rounded-lg shadow-lg z-50">


                <div className="p-4 border-b border-[#DEDEDE] flex items-center justify-between">

                  <p className="font-semibold">
                    Notifications
                  </p>


                  {
                    unreadCount > 0 && (

                      <button
                        onClick={handleMarkAllRead}
                        className="text-sm text-[#EB8C00]"
                      >
                        Mark all as read
                      </button>

                    )
                  }


                </div>



                {
                  notifications.length === 0
                  ?

                  <div className="p-4 text-sm text-gray-500">
                    No notifications
                  </div>

                  :

                  notifications.map((n)=>(

                    <div
                      key={n.id}
                      className={`p-4 border-b border-gray-100 ${
                        !n.is_read
                        ?
                        "bg-orange-50"
                        :
                        "bg-white"
                      }`}
                    >

                      <p className="font-medium text-sm">
                        {n.title}
                      </p>


                      <p className="text-sm text-gray-600 mt-1">
                        {n.message}
                      </p>


                      {
                        !n.is_read && (

                          <button
                            onClick={() =>
                              handleMarkRead(n.id)
                            }
                            className="text-sm text-[#EB8C00] mt-2"
                          >
                            Mark as read
                          </button>

                        )
                      }


                    </div>

                  ))

                }


              </div>

            )
          }



        </div>





        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >

          <LogOut size={18}/>

          <span>
            Logout
          </span>

        </button>



      </div>


    </div>

  );
}