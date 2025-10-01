  // import React, { useEffect, useState } from "react";
  // import {
  //   useData,
  //   useUserInfo,
  //   useCardControl
  // } from "@ellucian/experience-extension-utils";

  // const StudentClassesAcademianCard = () => {
  //   const { getEthosQuery } = useData();
  //   const userInfo = useUserInfo(); // Get full user info
  //   const { firstName } = userInfo || {};
  //   const { setLoadingStatus, setErrorMessage } = useCardControl();

  //   const [sections, setSections] = useState([]);
  //   const [loading, setLoading] = useState(true);

  //   // 🔍 Log the current user info when component mounts or userInfo changes
  //   useEffect(() => {
  //     console.log("Current user info:", userInfo);
  //   }, [userInfo]);

  //   useEffect(() => {
  //     async function fetchSections() {
  //       try {
  //         setLoading(true);
  //         setLoadingStatus(true);

  //         // Call the named query from extension.js
  //         const result = await getEthosQuery({queryId:"section-registrations", properties:{
  //           registrantId: null, // Pass null to let Experience auto-populate the current user
  //         }});

  //         console.log("Section registration results:", result.data.sectionRegistration.edges);

  //         // Access the edges array from the result
  //         setSections(result?.sectionRegistration?.edges || []);
  //       } catch (err) {
  //         setErrorMessage({
  //           headerMessage: "Error fetching student sections",
  //           textMessage: err.message,
  //           iconName: "error",
  //           iconColor: "red"
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
  //             const section = node.section16 || node.section;
  //             const course = section?.course16 || section?.course;
  //             const title =
  //               course?.titles?.[0]?.value || section?.titles?.[0]?.value;

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

  // export default StudentClassesAcademianCard;

import React, { useEffect, useState } from "react";
import {
  useData,
  useUserInfo,
  useCardControl
} from "@ellucian/experience-extension-utils";

const StudentClassesCard = () => {
  const { getEthosQuery } = useData();
  const { firstName } = useUserInfo() || {};
  const { setLoadingStatus, setErrorMessage } = useCardControl();

  const [sections, setSections] = useState([]);
  const [terms, setTerms] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSections() {
      try {
        setLoading(true);
        setLoadingStatus(true);

        const result = await getEthosQuery({
          queryId: "section-registrations",
          properties: { personId: null } // auto-populated by Experience
        });

        const registrations = result?.data?.sectionRegistration?.edges || [];
        setSections(registrations);

        // Extract unique terms
        const termMap = {};
        registrations.forEach(({ node }) => {
          const term = node.section16?.reportingAcademicPeriod16;
          if (term && !termMap[term.id]) {
            termMap[term.id] = term;
          }
        });

        const sortedTerms = Object.values(termMap).sort(
          (a, b) => new Date(b.startOn) - new Date(a.startOn)
        );
        setTerms(sortedTerms);

        // Pick current term
        const today = new Date();
        const currentTerm = sortedTerms.find(
          t => new Date(t.startOn) <= today && new Date(t.endOn) >= today
        );
        setSelectedTerm(currentTerm || sortedTerms[0]);
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
    return <p>No registered sections found.</p>;
  }

  const sectionsForTerm = sections.filter(
    ({ node }) =>
      node.section16?.reportingAcademicPeriod16?.id === selectedTerm?.id
  );

  return (
    <div style={{ padding: "1rem", maxHeight: "500px", overflowY: "auto" }}>
      <h3 style={{ marginBottom: "0.5rem" }}>
        Hello {firstName || "Student"} 👋
      </h3>

      {/* Term Selector */}
      <div style={{ marginBottom: "1rem" }}>
        <div style={{ fontWeight: "bold", marginRight: "0.5rem" }}>
          Term:
        </div>
        <select
          value={selectedTerm?.id}
          onChange={e =>
            setSelectedTerm(terms.find(t => t.id === e.target.value))
          }
          style={{
            padding: "0.25rem 0.5rem",
            fontSize: "1rem",
            borderRadius: "6px",
            border: "1px solid #ccc"
          }}
        >
          {terms.map(term => (
            <option key={term.id} value={term.id}>
              {term.title}
            </option>
          ))}
        </select>
      </div>

      {/* Course List */}
      <div>
        {sectionsForTerm.map(({ node }) => {
          const section = node.section16;
          const course = section?.course16;
          const subject = course?.subject6?.abbreviation || "";
          const number = course?.number || "";
          const courseTitle =
            course?.titles?.[0]?.value || section?.titles?.[0]?.value;

          const title = `${subject} ${number} - ${courseTitle}`;

          // Placeholder meeting info (replace with actual meeting times if available)
          const meetingTime =
            section?.startOn && section?.endOn
              ? `${new Date(section.startOn).toLocaleDateString()} - ${new Date(
                  section.endOn
                ).toLocaleDateString()}`
              : "WEB";

          return (
            <div
              key={section?.id}
              style={{
                padding: "0.75rem",
                marginBottom: "0.5rem",
                borderBottom: "1px solid #eee"
              }}
            >
              {/* <a
                href="/"
                style={{
                  fontWeight: "bold",
                  color: "#1976d2",
                  textDecoration: "none",
                  display: "block"
                }}
              > */}
                <div>

                {title}
                </div>
              {/* </a> */}
              <div style={{ fontSize: "0.85rem", color: "#555" }}>
                {meetingTime}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StudentClassesCard;
