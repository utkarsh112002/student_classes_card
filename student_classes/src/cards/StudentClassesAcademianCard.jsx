// import React, { useEffect, useState } from "react";
// import { useData, useUserInfo, useCardControl } from "@ellucian/experience-extension-utils";

// const StudentClassesCard = () => {
//   const { getEthosQuery } = useData();
//   const { firstName } = useUserInfo();
//   const { setLoadingStatus, setErrorMessage } = useCardControl();

//   const [sections, setSections] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     async function fetchSections() {
//       try {
//         setLoading(true);
//         setLoadingStatus(true);

//         // Call the named query from extension.js
//         const result = await getEthosQuery({queryId:"section-registrations", properties:{
//           registrantId: null, // Pass null to let Experience auto-populate the current user
//         }});

//         console.log(result, "resultsresultsresultsresultsresultsresultsresultsresultsresultsresultsresultsresultsresultsresultsresultsresults")
//         // Access the edges array in your working query
//         setSections(result?.sectionRegistration?.edges || []);
//       } catch (err) {
//         setErrorMessage({
//           headerMessage: "Error fetching student sections",
//           textMessage: err.message,
//           iconName: "error",
//           iconColor: "red",
//         });
//       } finally {
//         setLoading(false);
//         setLoadingStatus(false);
//       }
//     }

//     fetchSections();
//   }, [getEthosQuery, setLoadingStatus, setErrorMessage]);

//   if (loading) {
//     return <p>Loading your classes…</p>;
//   }

//   if (!sections.length) {
//     return <p>No registered sections found for today.</p>;
//   }

//   return (
//     <div style={{ padding: "1rem" }}>
//       <h3>Hello {firstName || "Student"} 👋</h3>
//       <p>Your registered sections:</p>

//       <table style={{ width: "100%", borderCollapse: "collapse" }}>
//         <thead>
//           <tr>
//             <th style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}>Course</th>
//             <th style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}>Code</th>
//             <th style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}>Number</th>
//             <th style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}>Title</th>
//             <th style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}>Start - End</th>
//           </tr>
//         </thead>
//         <tbody>
//           {sections.map(({ node }) => {
//             const section = node.section16 || node.section; // adjust to match your query
//             const course = section?.course16 || section?.course;
//             const title = course?.titles?.[0]?.value || section?.titles?.[0]?.value;
//             return (
//               <tr key={section?.id}>
//                 <td>{course?.subject6?.abbreviation || course?.subject?.abbreviation}</td>
//                 <td>{section?.code}</td>
//                 <td>{section?.number}</td>
//                 <td>{title}</td>
//                 <td>
//                   {section?.startOn} - {section?.endOn}
//                 </td>
//               </tr>
//             );
//           })}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default StudentClassesCard;

import React, { useEffect, useState } from "react";
import {
  useData,
  useUserInfo,
  useCardControl
} from "@ellucian/experience-extension-utils";

const StudentClassesCard = () => {
  const { getEthosQuery } = useData();
  const userInfo = useUserInfo(); // Get full user info
  const { firstName } = userInfo || {};
  const { setLoadingStatus, setErrorMessage } = useCardControl();

  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔍 Log the current user info when component mounts or userInfo changes
  useEffect(() => {
    console.log("Current user info:", userInfo);
  }, [userInfo]);

  useEffect(() => {
    async function fetchSections() {
      try {
        setLoading(true);
        setLoadingStatus(true);

        // Call the named query from extension.js
        const result = await getEthosQuery({queryId:"section-registrations", properties:{
          registrantId: null, // Pass null to let Experience auto-populate the current user
        }});

        console.log("Section registration results:", result);

        // Access the edges array from the result
        setSections(result?.sectionRegistration?.edges || []);
      } catch (err) {
        setErrorMessage({
          headerMessage: "Error fetching student sections",
          textMessage: err.message,
          iconName: "error",
          iconColor: "red"
        });
      } finally {
        setLoading(false);
        setLoadingStatus(false);
      }
    }

    fetchSections();
  }, [getEthosQuery, setLoadingStatus, setErrorMessage]);

  if (loading) {
    return <p>Loading your classes…</p>;
  }

  if (!sections.length) {
    return <p>No registered sections found for today.</p>;
  }

  return (
    <div style={{ padding: "1rem" }}>
      <h3>Hello {firstName || "Student"} 👋</h3>
      <p>Your registered sections:</p>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}>Course</th>
            <th style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}>Code</th>
            <th style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}>Number</th>
            <th style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}>Title</th>
            <th style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}>Start - End</th>
          </tr>
        </thead>
        <tbody>
          {sections.map(({ node }) => {
            const section = node.section16 || node.section;
            const course = section?.course16 || section?.course;
            const title =
              course?.titles?.[0]?.value || section?.titles?.[0]?.value;

            return (
              <tr key={section?.id}>
                <td>{course?.subject6?.abbreviation || course?.subject?.abbreviation}</td>
                <td>{section?.code}</td>
                <td>{section?.number}</td>
                <td>{title}</td>
                <td>
                  {section?.startOn} - {section?.endOn}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default StudentClassesCard;
