// /* eslint-disable react/prop-types */
// import React, { useEffect, useState } from "react";
// import { usePageControl, useData } from "@ellucian/experience-extension-utils";
// import { useLocation, useHistory } from "react-router-dom";

// const CoursePage = (props) => {
//   const {
//     cardInfo: { cardId },
//   } = props;

//   const { authenticatedEthosFetch } = useData();
//   const { setPageTitle } = usePageControl();
//   const history = useHistory();

//   const [courseData, setCourseData] = useState(null);
//   const [instructors, setInstructors] = useState([]);
//   const [instructionalEvents, setInstructionalEvents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const { search } = useLocation();
//   const searchParams = new URLSearchParams(search);
//   const sectionId = searchParams.get("sectionId");

//   useEffect(() => {
//     // Retrieve stored course data from localStorage
//     const storedData = localStorage.getItem("selectedCourse");
//     if (storedData) {
//       try {
//         const parsedData = JSON.parse(storedData);
//         setCourseData(parsedData);
//         setPageTitle(parsedData.courseName || "Course Details");
        
//         // Debug: Check if section ID matches
//         if (parsedData.section?.id && sectionId && parsedData.section.id !== sectionId) {
//           console.warn("⚠️ Section ID mismatch:", {
//             fromURL: sectionId,
//             fromCourseData: parsedData.section.id
//           });
//         }
//       } catch (err) {
//         console.error("Error parsing stored course data:", err);
//         setPageTitle("Course Details");
//       }
//     } else {
//       setPageTitle("Course Details");
//     }
//   }, [setPageTitle, sectionId]);

//   useEffect(() => {
//     let isMounted = true;

//     const fetchInstructionalEvents = async (sectionId) => {
//       if (!isMounted) return;
      
//       try {
//         //console.log("=== INSTRUCTIONAL EVENTS DEBUG ===");
//         console.log("Fetching instructional events for sectionId:", sectionId);

//         const queryParams = new URLSearchParams();
//         queryParams.append('sectionId', sectionId);
//         queryParams.append('cardId', cardId);
//         queryParams.append('ethosAPIKey', "2e5330bd-483a-42c8-925b-d59edf93345f");

//         const resource = `GetInstructionalEvents-ServerlessAPI?${queryParams.toString()}`;
//         console.log("Full resource URL:", resource);
        
//         const options = {
//           method: 'GET',
//           headers: {
//             'Accept': 'application/json',
//             'Content-Type': 'application/json',
//           },
//         };

//         const response = await authenticatedEthosFetch(resource, options);
        
//         console.log("Response status:", response.status);
//         console.log("Response ok:", response.ok);
        
//         if (!response.ok) {
//           const errorText = await response.text();
//           console.error("Instructional Events API Error:", errorText);
//           throw new Error(`HTTP ${response.status}: ${response.statusText || errorText}`);
//         }

//         const data = await response.json();
//         //console.log("✓ Instructional Events API response:", data);
//         //console.log("Response type:", typeof data);
//         //console.log("Is array:", Array.isArray(data));
        
//         if (data.errors && data.errors.length > 0) {
//           console.error("API returned errors:", data.errors);
//           throw new Error(data.errors[0].description || data.errors[0].details || "API error");
//         }

//         let events = [];
        
//         if (Array.isArray(data) && data.length > 0) {
//           console.log("Found events in direct array");
//           events = data;
//         } else if (data.data && Array.isArray(data.data)) {
//           console.log("Found events in data.data");
//           events = data.data;
//         } else if (data.payload && Array.isArray(data.payload)) {
//           console.log("Found events in data.payload");
//           events = data.payload;
//         } else if (data.instructionalEvents && Array.isArray(data.instructionalEvents)) {
//           console.log("Found events in data.instructionalEvents");
//           events = data.instructionalEvents;
//         } else if (data.message && Array.isArray(data.message)) {
//           console.log("Found events in data.message");
//           events = data.message;
//         } else {
//           console.warn("Could not find events in any known structure. Full response:", JSON.stringify(data, null, 2));
//         }
        
//         console.log("Extracted instructional events count:", events.length);
//         if (events.length > 0) {
//           console.log("Sample event:", events[0]);
//         }
        
//         if (isMounted) {
//           setInstructionalEvents(events);
//         }

//       } catch (err) {
//         console.error("Failed to fetch instructional events:", err.message);
//         console.error("Full error:", err);
//         if (isMounted) {
//           setInstructionalEvents([]);
//         }
//       }
//     };

//     const fetchInstructorsFromServerless = async (sectionId) => {
//       if (!isMounted) return;

//       try {
//         //console.log("=== SECTION INSTRUCTORS DEBUG ===");
//         console.log("Fetching instructors for sectionId:", sectionId);
//         console.log("cardId:", cardId);

//         const queryParams = new URLSearchParams();
//         queryParams.append('sectionId', sectionId);
//         queryParams.append('cardId', cardId);
//         queryParams.append('ethosAPIKey', "2e5330bd-483a-42c8-925b-d59edf93345f");

//         const resource = `GetSectionInstructors-ServerlessAPI?${queryParams.toString()}`;
//         console.log("Full resource URL:", resource);
        
//         const options = {
//           method: 'GET',
//           headers: {
//             'Accept': 'application/json',
//             'Content-Type': 'application/json',
//           },
//         };

//         const response = await authenticatedEthosFetch(resource, options);

//         console.log("Response status:", response.status);
//         console.log("Response ok:", response.ok);

//         if (!response.ok) {
//           const errorText = await response.text();
//           console.error("Section Instructors API Error:", errorText);
//           console.error("Response status:", response.status);
//           console.error("Response statusText:", response.statusText);
          
//           // More detailed error message
//           throw new Error(`Failed to fetch instructors: HTTP ${response.status} - ${errorText || response.statusText}`);
//         }

//         const data = await response.json();
//         console.log("✓ Section Instructors API response:", data);
//         console.log("Response structure:", {
//           isArray: Array.isArray(data),
//           hasData: !!data.data,
//           hasPayload: !!data.payload,
//           hasMessage: !!data.message,
//           keys: Object.keys(data)
//         });
        
//         if (data.errors && data.errors.length > 0) {
//           console.error("API returned errors:", data.errors);
//           throw new Error(data.errors[0].description || data.errors[0].details || "API error");
//         }

//         let instructorData = [];
        
//         // Handle different response structures - same as instructional events
//         if (Array.isArray(data)) {
//           console.log("Found instructors in direct array");
//           instructorData = data;
//         } else if (data.data && Array.isArray(data.data)) {
//           console.log("Found instructors in data.data");
//           instructorData = data.data;
//         } else if (data.payload && Array.isArray(data.payload)) {
//           console.log("Found instructors in data.payload");
//           instructorData = data.payload;
//         } else if (data.message && Array.isArray(data.message)) {
//           console.log("Found instructors in data.message");
//           instructorData = data.message;
//         } else if (data.instructors && Array.isArray(data.instructors)) {
//           console.log("Found instructors in data.instructors");
//           instructorData = data.instructors;
//         } else {
//           console.warn("Could not find instructors in any known structure. Full response:", JSON.stringify(data, null, 2));
//         }

//         console.log("Extracted instructor data count:", instructorData.length);
//         if (instructorData.length > 0) {
//           console.log("Sample instructor:", instructorData[0]);
//         }

//         if (instructorData.length === 0) {
//           if (isMounted) {
//             setInstructors([]);
//             setError("No instructors found for this section. The section may not have any instructors assigned yet.");
//           }
//           return;
//         }

//         const mappedInstructors = instructorData.map((item) => ({
//           node: {
//             id: item.id || "",
//             instructorRole: item.instructorRole || "",
//             workLoadPercentage: item.responsibilityPercentage || item.workLoad || null,
//             workStartOn: item.workStartOn || null,
//             workEndOn: item.workEndOn || null,
//             instructorId: item.instructor?.id || "",
//             sectionId: item.section?.id || "",
//             instructionalMethodId: item.instructionalMethod?.id || "",
//           },
//         }));

//         console.log("Mapped instructors count:", mappedInstructors.length);
//         console.log("Sample mapped instructor:", mappedInstructors[0]);

//         const instructorsWithDetails = await Promise.all(
//           mappedInstructors.map(async (instructor) => {
//             try {
//               const personId = instructor.node.instructorId;
              
//               if (!personId) {
//                 console.warn("No personId found for instructor:", instructor);
//                 return instructor;
//               }
              
//               console.log("Fetching person details for:", personId);
              
//               const personQueryParams = new URLSearchParams();
//               personQueryParams.append('personId', personId);
//               personQueryParams.append('cardId', cardId);
//               personQueryParams.append('ethosAPIKey', "2e5330bd-483a-42c8-925b-d59edf93345f");
              
//               const personResource = `GetPersonDetails-ServerlessAPI?${personQueryParams.toString()}`;
//               console.log("Person details resource URL:", personResource);
              
//               const personResponse = await authenticatedEthosFetch(personResource, {
//                 method: 'GET',
//                 headers: {
//                   'Accept': 'application/json',
//                   'Content-Type': 'application/json',
//                 },
//               });
              
//               console.log("Person API response status:", personResponse.status);
              
//               if (!personResponse.ok) {
//                 const errorText = await personResponse.text();
//                 console.error("Person Details API Error:", errorText);
//                 console.error("Failed to fetch person details for:", personId);
//                 return instructor;
//               }
              
//               const personData = await personResponse.json();
//               console.log("Person API response for", personId, ":", personData);
              
//               let person = null;
              
//               // Handle different response structures - consistent with other APIs
//               if (personData.id) {
//                 person = personData;
//               } else if (personData.data && personData.data.id) {
//                 person = personData.data;
//               } else if (personData.payload && personData.payload.id) {
//                 person = personData.payload;
//               } else if (personData.message && personData.message.id) {
//                 person = personData.message;
//               } else if (Array.isArray(personData) && personData.length > 0) {
//                 person = personData[0];
//               } else if (Array.isArray(personData.data) && personData.data.length > 0) {
//                 person = personData.data[0];
//               } else if (Array.isArray(personData.payload) && personData.payload.length > 0) {
//                 person = personData.payload[0];
//               }
              
//               if (person && person.id) {
//                 //console.log("✓ Person details fetched successfully for:", personId);
//                 return {
//                   ...instructor,
//                   node: {
//                     ...instructor.node,
//                     instructor12: {
//                       id: personId,
//                       credentials: person.credentials || [],
//                       names: person.names || [],
//                       emails: person.emails || [],
//                       phones: person.phones || [],
//                       addresses: person.addresses || [],
//                     },
//                   },
//                 };
//               } else {
//                 //console.warn("Could not extract person data from response for:", personId);
//                 console.warn("Response structure:", Object.keys(personData));
//               }
              
//               return instructor;
//             } catch (err) {
//               console.error(`Error fetching person details for ${instructor.node.instructorId}:`, err);
//               console.error("Full error:", err);
//               return instructor;
//             }
//           })
//         );
        
//         if (isMounted) {
//           //console.log("✓ All instructor details fetched. Total count:", instructorsWithDetails.length);
//           setInstructors(instructorsWithDetails);
//         }

//       } catch (err) {
//         // console.error("=== INSTRUCTOR FETCH ERROR ===");
//         // console.error("Error message:", err.message);
//         // console.error("Full error:", err);
//         // console.error("Stack trace:", err.stack);
//         if (isMounted) {
//           setInstructors([]);
//           setError(`Failed to load instructors: ${err.message}`);
//         }
//       } finally {
//         if (isMounted) {
//           setLoading(false);
//         }
//       }
//     };

//     if (sectionId) {
//       fetchInstructorsFromServerless(sectionId);
//       fetchInstructionalEvents(sectionId);
//     } else {
//       setError("No section ID provided");
//       setLoading(false);
//     }

//     return () => {
//       isMounted = false;
//     };
//   }, [authenticatedEthosFetch, sectionId, cardId]);

//   const formatDate = dateString => {
//     if (!dateString) return "";
//     try {
//       const date = new Date(dateString);
//       return date.toLocaleDateString("en-US", {
//         month: "short",
//         day: "numeric",
//         year: "numeric",
//       });
//     } catch (err) {
//       return "";
//     }
//   };

//   const getPreferredName = (names) => {
//     if (!names || names.length === 0) return "N/A";
//     const preferred = names.find(n => n.preference === "preferred");
//     return preferred?.fullName || names[0]?.fullName || "N/A";
//   };

//   const getPreferredEmail = (emails) => {
//     if (!emails || emails.length === 0) return null;
//     const preferred = emails.find(e => e.preference === "preferred");
//     return preferred?.address || emails[0]?.address || null;
//   };

//   const getPreferredPhone = (phones) => {
//     if (!phones || phones.length === 0) return null;
//     const preferred = phones.find(p => p.preference === "preferred");
//     return preferred?.number || phones[0]?.number || null;
//   };

//   if (loading) {
//     return <div style={{ padding: "1rem" }}>Loading course details...</div>;
//   }

//   return (
//     <div style={{ padding: "1rem" }}>
//       {/* Course Header */}
//       {courseData && (
//         <div style={{ marginBottom: "2rem" }}>
//           <h2>{courseData.courseName}</h2>
//           <div style={{ color: "#666", marginTop: "0.5rem" }}>
//             <p>
//               <strong>Subject:</strong> {courseData.subjectAbbreviation} -{" "}
//               {courseData.subjectTitle}
//             </p>
//             {/* <p>
//               <strong>Subject ID:</strong> {courseData.subjectId}
//             </p> */}
//             {/* <p>
//               <strong>Course ID:</strong> {courseData.courseId}
//             </p> */}
//             {/* <p>
//               <strong>Term:</strong> {courseData.termTitle}
//             </p>
//             <p>
//               <strong>Section:</strong> {courseData.sectionNumber || courseData.sectionCode}
//             </p> */}
//             {courseData.startOn && courseData.endOn && (
//               <p>
//                 <strong>Duration:</strong> {formatDate(courseData.startOn)} -{" "}
//                 {formatDate(courseData.endOn)}
//               </p>
//             )}
            
//             {/* Display Section Information */}
//             {/* {courseData.section && (
//               <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #ddd" }}>
//                 <h4>Section Details</h4>
//                 {courseData.section.id && (
//                   <p>
//                     <strong>Section ID:</strong> {courseData.section.id}
//                   </p>
//                 )}
//                 {courseData.section.titles && courseData.section.titles.length > 0 && (
//                   <div>
//                     <strong>Section Titles:</strong>
//                     <ul style={{ marginTop: "0.5rem", paddingLeft: "1.5rem" }}>
//                       {courseData.section.titles.map((titleObj, idx) => (
//                         <li key={idx}>{titleObj.value || "N/A"}</li>
//                       ))}
//                     </ul>
//                   </div>
//                 )}
//               </div>
//             )} */}

//             {/* Display Academic Period Information */}
//             {courseData.academicPeriod && (
//               <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #ddd" }}>
//                 {/* <h4>Academic Period Details</h4> */}
//                 {/* {courseData.academicPeriod.code && (
//                   <p>
//                     <strong>Period Code:</strong> {courseData.academicPeriod.code}
//                   </p>
//                 )} */}
//                 {/* {courseData.academicPeriod.title && (
//                   <p>
//                     <strong>Period Title:</strong> {courseData.academicPeriod.title}
//                   </p>
//                 )} */}
//                 {/* {courseData.academicPeriod.id && (
//                   <p>
//                     <strong>Period ID:</strong> {courseData.academicPeriod.id}
//                   </p>
//                 )} */}
//                 {courseData.academicPeriod.startOn && courseData.academicPeriod.endOn && (
//                   <p>
//                     <strong>Period Duration:</strong>{" "}
//                     {formatDate(courseData.academicPeriod.startOn)} -{" "}
//                     {formatDate(courseData.academicPeriod.endOn)}
//                   </p>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       {/* Error message */}
//       {error && (
//         <div style={{ 
//           padding: "1rem", 
//           backgroundColor: "#fff3cd", 
//           border: "1px solid #ffc107",
//           borderRadius: "4px",
//           marginBottom: "1rem",
//           color: "#856404"
//         }}>
//           <p><strong>Note:</strong> {error}</p>
//         </div>
//       )}

//       {/* Instructors Section */}
//       <div style={{ marginBottom: "2rem" }}>
//         <h3>Instructors</h3>
//         {instructors.length === 0 && !error ? (
//           <p>No instructor information available.</p>
//         ) : (
//           <div>
//             {instructors.map(({ node }, index) => {
//               const instructor = node.instructor12;
//               const instructorName = getPreferredName(instructor?.names);
//               const email = getPreferredEmail(instructor?.emails);
//               const phone = getPreferredPhone(instructor?.phones);

//               return (
//                 <div
//                   key={node.id || index}
//                   style={{
//                     padding: "1rem",
//                     border: "1px solid #ddd",
//                     borderRadius: "8px",
//                     marginBottom: "1rem",
//                     backgroundColor: "#f9f9f9",
//                   }}
//                 >
//                   {/* Instructor Name */}
//                   <div style={{ marginBottom: "0.5rem" }}>
//                     <strong style={{ fontSize: "1.1rem" }}>{instructorName}</strong>
//                   </div>

//                   {/* Role */}
//                   {/* {node.instructorRole && (
//                     <div style={{ marginBottom: "0.5rem" }}>
//                       <strong>Role:</strong> {node.instructorRole}
//                     </div>
//                   )} */}

//                   {/* Email */}
//                   {email && (
//                     <div style={{ marginBottom: "0.5rem" }}>
//                       <strong>Email:</strong>{" "}
//                       <a href={`mailto:${email}`} style={{ color: "#007bff" }}>
//                         {email}
//                       </a>
//                     </div>
//                   )}

//                   {/* Phone */}
//                   {phone && (
//                     <div style={{ marginBottom: "0.5rem" }}>
//                       <strong>Phone:</strong> {phone}
//                     </div>
//                   )}

//                   {/* Work Load Percentage */}
//                   {/* {node.workLoadPercentage && (
//                     <div style={{ marginBottom: "0.5rem" }}>
//                       <strong>Responsibility:</strong> {node.workLoadPercentage}%
//                     </div>
//                   )} */}

//                   {/* Work Period */}
//                   {/* {node.workStartOn && node.workEndOn && (
//                     <div style={{ marginBottom: "0.5rem", fontSize: "0.9rem", color: "#666" }}>
//                       <strong>Work Period:</strong> {formatDate(node.workStartOn)} - {formatDate(node.workEndOn)}
//                     </div>
//                   )} */}
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </div>

//       {/* Instructional Events Section */}
//       <div style={{ marginBottom: "2rem" }}>
//         <h3>Class Schedule</h3>
//         {instructionalEvents.length === 0 ? (
//           <p>No schedule information available.</p>
//         ) : (
//           <div>
//             {instructionalEvents.map((event, index) => (
//               <div
//                 key={event.id || index}
//                 style={{
//                   padding: "1rem",
//                   border: "1px solid #ddd",
//                   borderRadius: "8px",
//                   marginBottom: "1rem",
//                   backgroundColor: "#f0f8ff",
//                 }}
//               >
//                 {/* Instructional Method */}
//                 {event.instructionalMethod?.title && (
//                   <div style={{ marginBottom: "0.5rem" }}>
//                     <strong style={{ fontSize: "1.1rem" }}>
//                       {event.instructionalMethod.title}
//                     </strong>
//                   </div>
//                 )}

//                 {/* Recurrence Pattern */}
//                 {event.recurrence && (
//                   <div style={{ marginBottom: "0.5rem" }}>
//                     {event.recurrence.timePeriod && (
//                       <div>
//                         <strong>Time:</strong>{" "}
//                         {event.recurrence.timePeriod.startOn} - {event.recurrence.timePeriod.endOn}
//                       </div>
//                     )}
//                     {event.recurrence.repeatRule?.daysOfWeek && (
//                       <div style={{ marginTop: "0.25rem" }}>
//                         <strong>Days:</strong>{" "}
//                         {event.recurrence.repeatRule.daysOfWeek.map(day => 
//                           day.charAt(0).toUpperCase() + day.slice(1).toLowerCase()
//                         ).join(", ")}
//                       </div>
//                     )}
//                   </div>
//                 )}

//                 {/* Locations */}
//                 {event.locations && event.locations.length > 0 && (
//                   <div style={{ marginBottom: "0.5rem" }}>
//                     <strong>Location:</strong>
//                     {event.locations.map((loc, idx) => (
//                       <div key={idx} style={{ marginLeft: "1rem", marginTop: "0.25rem" }}>
//                         {loc.location?.room?.title && (
//                           <div>Room: {loc.location.room.title}</div>
//                         )}
//                         {loc.location?.building?.title && (
//                           <div>Building: {loc.location.building.title}</div>
//                         )}
//                       </div>
//                     ))}
//                   </div>
//                 )}

//                 {/* Instructors for this event */}
//                 {event.instructors && event.instructors.length > 0 && (
//                   <div style={{ marginBottom: "0.5rem", fontSize: "0.9rem" }}>
//                     <strong>Instructor(s):</strong>{" "}
//                     {event.instructors.map((inst, idx) => (
//                       <span key={idx}>
//                         {inst.instructor?.fullName || "N/A"}
//                         {idx < event.instructors.length - 1 ? ", " : ""}
//                       </span>
//                     ))}
//                   </div>
//                 )}

//                 {/* Workload */}
//                 {/* {event.workload !== undefined && event.workload !== null && (
//                   <div style={{ fontSize: "0.9rem", color: "#666" }}>
//                     <strong>Workload:</strong> {event.workload}
//                   </div>
//                 )} */}
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* Back Button */}
//       <div style={{ marginTop: "2rem" }}>
//         <button
//           onClick={() => history.goBack()}
//           style={{
//             padding: "0.5rem 1rem",
//             backgroundColor: "#007bff",
//             color: "white",
//             border: "none",
//             borderRadius: "4px",
//             cursor: "pointer",
//           }}
//         >
//           Back to Classes
//         </button>
//       </div>
//     </div>
//   );
// };

// export default CoursePage;





/* eslint-disable react/prop-types */
import React, { useEffect, useState } from "react";
import { usePageControl, useData } from "@ellucian/experience-extension-utils";
import { useLocation, useHistory } from "react-router-dom";
import campusImage from "../assets/image.png";

// Component to handle both dynamic and static rendering of schedule and location
const ScheduleLocationInfo = ({ instructionalEvents, courseData }) => {
  const formatSchedule = (events) => {
    if (!events || events.length === 0) return null;
    
    const event = events[0];
    let daysStr = null;
    let timeStr = null;

    // Check for different possible structures in the data
    if (event.recurrence?.repeatRule?.daysOfWeek) {
      const daysMap = {
        monday: "Mon",
        tuesday: "Tue", 
        wednesday: "Wed",
        thursday: "Thu",
        friday: "Fri",
        saturday: "Sat",
        sunday: "Sun"
      };
      daysStr = event.recurrence.repeatRule.daysOfWeek
        .map(day => daysMap[day.toLowerCase()] || day)
        .join("/");
    } else if (event.daysOfWeek) {
      // Alternative structure
      const daysMap = {
        monday: "Mon",
        tuesday: "Tue", 
        wednesday: "Wed",
        thursday: "Thu",
        friday: "Fri",
        saturday: "Sat",
        sunday: "Sun"
      };
      daysStr = event.daysOfWeek
        .map(day => daysMap[day.toLowerCase()] || day)
        .join("/");
    }

    if (event.recurrence?.timePeriod) {
      const start = event.recurrence.timePeriod.startOn || "";
      const end = event.recurrence.timePeriod.endOn || "";
      if (start && end) {
        timeStr = `${start} - ${end}`;
      }
    } else if (event.startTime && event.endTime) {
      // Alternative structure
      timeStr = `${event.startTime} - ${event.endTime}`;
    }

    return { days: daysStr, time: timeStr };
  };

  const getCampusLocation = (events) => {
    if (!events || events.length === 0) return null;
    
    const event = events[0];
    let building = null;
    let room = null;
    
    if (event.locations && event.locations.length > 0) {
      const loc = event.locations[0].location;
      building = loc?.building?.title || loc?.building || "";
      room = loc?.room?.title || loc?.room || "";
    } else if (event.location) {
      // Alternative structure
      building = event.location.building || "";
      room = event.location.room || "";
    }
    
    return { building, room };
  };

  // Try to get dynamic data
  const scheduleData = formatSchedule(instructionalEvents);
  const locationData = getCampusLocation(instructionalEvents);
  
  // Check if we have dynamic data
  const hasDynamicSchedule = scheduleData && scheduleData.days && scheduleData.time;
  const hasDynamicLocation = locationData && (locationData.building || locationData.room);
  
  // Use static data from courseData if dynamic data is not available
  const staticSchedule = courseData?.schedule || "Mon/Wed 2:00 PM - 4:15 PM";
  const staticLocation = courseData?.location || "Panama City Campus";
  
  return (
    <div>
      <div style={{ 
        fontSize: "1rem", 
        color: "#555",
        marginBottom: "0.5rem"
      }}>
        {hasDynamicSchedule ? `${scheduleData.days} ${scheduleData.time}` : staticSchedule}
      </div>

      <div style={{ 
        fontSize: "1rem", 
        color: "#555",
        marginBottom: "1.5rem"
      }}>
        {hasDynamicLocation ? 
          (locationData.building && locationData.room ? 
            `Panama City Campus, ${locationData.building} ${locationData.room}` : 
            locationData.building ? 
              `Panama City Campus, ${locationData.building}` : 
              "Panama City Campus"
          ) : 
          staticLocation
        }
      </div>
    </div>
  );
};

const CoursePage = (props) => {
  const {
    cardInfo: { cardId },
  } = props;

  const { authenticatedEthosFetch } = useData();
  const { setPageTitle } = usePageControl();
  const history = useHistory();

  const [courseData, setCourseData] = useState(null);
  const [instructors, setInstructors] = useState([]);
  const [instructionalEvents, setInstructionalEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const sectionId = searchParams.get("sectionId");

  useEffect(() => {
    // Retrieve stored course data from localStorage
    const storedData = localStorage.getItem("selectedCourse");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setCourseData(parsedData);
        setPageTitle(parsedData.courseName || "Course Details");
        
        // Debug: Check if section ID matches
        if (parsedData.section?.id && sectionId && parsedData.section.id !== sectionId) {
          console.warn("⚠️ Section ID mismatch:", {
            fromURL: sectionId,
            fromCourseData: parsedData.section.id
          });
        }
      } catch (err) {
        console.error("Error parsing stored course data:", err);
        setPageTitle("Course Details");
      }
    } else {
      setPageTitle("Course Details");
    }
  }, [setPageTitle, sectionId]);

  useEffect(() => {
    let isMounted = true;

    const fetchInstructionalEvents = async (sectionId) => {
      if (!isMounted) return;
      
      try {
        console.log("=== INSTRUCTIONAL EVENTS DEBUG ===");
        console.log("Fetching instructional events for sectionId:", sectionId);

        const queryParams = new URLSearchParams();
        queryParams.append('sectionId', sectionId);
        queryParams.append('cardId', cardId);
        queryParams.append('ethosAPIKey', "2e5330bd-483a-42c8-925b-d59edf93345f");

        const resource = `GetInstructionalEvents-ServerlessAPI?${queryParams.toString()}`;
        console.log("Full resource URL:", resource);
        
        const options = {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        };

        const response = await authenticatedEthosFetch(resource, options);
        
        console.log("Response status:", response.status);
        console.log("Response ok:", response.ok);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Instructional Events API Error:", errorText);
          throw new Error(`HTTP ${response.status}: ${response.statusText || errorText}`);
        }

        const data = await response.json();
        console.log("✓ Instructional Events API response:", data);
        console.log("Response type:", typeof data);
        console.log("Is array:", Array.isArray(data));
        
        if (data.errors && data.errors.length > 0) {
          console.error("API returned errors:", data.errors);
          throw new Error(data.errors[0].description || data.errors[0].details || "API error");
        }

        let events = [];
        
        if (Array.isArray(data) && data.length > 0) {
          console.log("Found events in direct array");
          events = data;
        } else if (data.data && Array.isArray(data.data)) {
          console.log("Found events in data.data");
          events = data.data;
        } else if (data.payload && Array.isArray(data.payload)) {
          console.log("Found events in data.payload");
          events = data.payload;
        } else if (data.instructionalEvents && Array.isArray(data.instructionalEvents)) {
          console.log("Found events in data.instructionalEvents");
          events = data.instructionalEvents;
        } else if (data.message && Array.isArray(data.message)) {
          console.log("Found events in data.message");
          events = data.message;
        } else {
          console.warn("Could not find events in any known structure. Full response:", JSON.stringify(data, null, 2));
        }
        
        console.log("Extracted instructional events count:", events.length);
        if (events.length > 0) {
          console.log("Sample event:", events[0]);
        }
        
        if (isMounted) {
          setInstructionalEvents(events);
        }

      } catch (err) {
        console.error("Failed to fetch instructional events:", err.message);
        console.error("Full error:", err);
        if (isMounted) {
          setInstructionalEvents([]);
        }
      }
    };

    const fetchInstructorsFromServerless = async (sectionId) => {
      if (!isMounted) return;

      try {
        console.log("=== SECTION INSTRUCTORS DEBUG ===");
        console.log("Fetching instructors for sectionId:", sectionId);
        console.log("cardId:", cardId);

        const queryParams = new URLSearchParams();
        queryParams.append('sectionId', sectionId);
        queryParams.append('cardId', cardId);
        queryParams.append('ethosAPIKey', "2e5330bd-483a-42c8-925b-d59edf93345f");

        const resource = `GetSectionInstructors-ServerlessAPI?${queryParams.toString()}`;
        console.log("Full resource URL:", resource);
        
        const options = {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        };

        const response = await authenticatedEthosFetch(resource, options);

        console.log("Response status:", response.status);
        console.log("Response ok:", response.ok);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Section Instructors API Error:", errorText);
          console.error("Response status:", response.status);
          console.error("Response statusText:", response.statusText);
          
          // More detailed error message
          throw new Error(`Failed to fetch instructors: HTTP ${response.status} - ${errorText || response.statusText}`);
        }

        const data = await response.json();
        console.log("✓ Section Instructors API response:", data);
        console.log("Response structure:", {
          isArray: Array.isArray(data),
          hasData: !!data.data,
          hasPayload: !!data.payload,
          hasMessage: !!data.message,
          keys: Object.keys(data)
        });
        
        if (data.errors && data.errors.length > 0) {
          console.error("API returned errors:", data.errors);
          throw new Error(data.errors[0].description || data.errors[0].details || "API error");
        }

        let instructorData = [];
        
        // Handle different response structures - same as instructional events
        if (Array.isArray(data)) {
          console.log("Found instructors in direct array");
          instructorData = data;
        } else if (data.data && Array.isArray(data.data)) {
          console.log("Found instructors in data.data");
          instructorData = data.data;
        } else if (data.payload && Array.isArray(data.payload)) {
          console.log("Found instructors in data.payload");
          instructorData = data.payload;
        } else if (data.message && Array.isArray(data.message)) {
          console.log("Found instructors in data.message");
          instructorData = data.message;
        } else if (data.instructors && Array.isArray(data.instructors)) {
          console.log("Found instructors in data.instructors");
          instructorData = data.instructors;
        } else {
          console.warn("Could not find instructors in any known structure. Full response:", JSON.stringify(data, null, 2));
        }

        console.log("Extracted instructor data count:", instructorData.length);
        if (instructorData.length > 0) {
          console.log("Sample instructor:", instructorData[0]);
        }

        if (instructorData.length === 0) {
          if (isMounted) {
            setInstructors([]);
            setError("No instructors found for this section. The section may not have any instructors assigned yet.");
          }
          return;
        }

        const mappedInstructors = instructorData.map((item) => ({
          node: {
            id: item.id || "",
            instructorRole: item.instructorRole || "",
            workLoadPercentage: item.responsibilityPercentage || item.workLoad || null,
            workStartOn: item.workStartOn || null,
            workEndOn: item.workEndOn || null,
            instructorId: item.instructor?.id || "",
            sectionId: item.section?.id || "",
            instructionalMethodId: item.instructionalMethod?.id || "",
          },
        }));

        console.log("Mapped instructors count:", mappedInstructors.length);
        console.log("Sample mapped instructor:", mappedInstructors[0]);

        const instructorsWithDetails = await Promise.all(
          mappedInstructors.map(async (instructor) => {
            try {
              const personId = instructor.node.instructorId;
              
              if (!personId) {
                console.warn("No personId found for instructor:", instructor);
                return instructor;
              }
              
              console.log("Fetching person details for:", personId);
              
              const personQueryParams = new URLSearchParams();
              personQueryParams.append('personId', personId);
              personQueryParams.append('cardId', cardId);
              personQueryParams.append('ethosAPIKey', "2e5330bd-483a-42c8-925b-d59edf93345f");
              
              const personResource = `GetPersonDetails-ServerlessAPI?${personQueryParams.toString()}`;
              console.log("Person details resource URL:", personResource);
              
              const personResponse = await authenticatedEthosFetch(personResource, {
                method: 'GET',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                },
              });
              
              console.log("Person API response status:", personResponse.status);
              
              if (!personResponse.ok) {
                const errorText = await personResponse.text();
                console.error("Person Details API Error:", errorText);
                console.error("Failed to fetch person details for:", personId);
                return instructor;
              }
              
              const personData = await personResponse.json();
              console.log("Person API response for", personId, ":", personData);
              
              let person = null;
              
              // Handle different response structures - consistent with other APIs
              if (personData.id) {
                person = personData;
              } else if (personData.data && personData.data.id) {
                person = personData.data;
              } else if (personData.payload && personData.payload.id) {
                person = personData.payload;
              } else if (personData.message && personData.message.id) {
                person = personData.message;
              } else if (Array.isArray(personData) && personData.length > 0) {
                person = personData[0];
              } else if (Array.isArray(personData.data) && personData.data.length > 0) {
                person = personData.data[0];
              } else if (Array.isArray(personData.payload) && personData.payload.length > 0) {
                person = personData.payload[0];
              }
              
              if (person && person.id) {
                console.log("✓ Person details fetched successfully for:", personId);
                return {
                  ...instructor,
                  node: {
                    ...instructor.node,
                    instructor12: {
                      id: personId,
                      credentials: person.credentials || [],
                      names: person.names || [],
                      emails: person.emails || [],
                      phones: person.phones || [],
                      addresses: person.addresses || [],
                    },
                  },
                };
              } else {
                console.warn("Could not extract person data from response for:", personId);
                console.warn("Response structure:", Object.keys(personData));
              }
              
              return instructor;
            } catch (err) {
              console.error(`Error fetching person details for ${instructor.node.instructorId}:`, err);
              console.error("Full error:", err);
              return instructor;
            }
          })
        );
        
        if (isMounted) {
          console.log("✓ All instructor details fetched. Total count:", instructorsWithDetails.length);
          setInstructors(instructorsWithDetails);
        }

      } catch (err) {
        console.error("=== INSTRUCTOR FETCH ERROR ===");
        console.error("Error message:", err.message);
        console.error("Full error:", err);
        console.error("Stack trace:", err.stack);
        if (isMounted) {
          setInstructors([]);
          setError(`Failed to load instructors: ${err.message}`);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (sectionId) {
      fetchInstructorsFromServerless(sectionId);
      fetchInstructionalEvents(sectionId);
    } else {
      setError("No section ID provided");
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [authenticatedEthosFetch, sectionId, cardId]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      });
    } catch (err) {
      return "";
    }
  };

  const getPreferredName = (names) => {
    if (!names || names.length === 0) return "N/A";
    const preferred = names.find((n) => n.preference === "preferred");
    return preferred?.fullName || names[0]?.fullName || "N/A";
  };

  const getPreferredEmail = (emails) => {
    if (!emails || emails.length === 0) return null;
    const preferred = emails.find((e) => e.preference === "preferred");
    return preferred?.address || emails[0]?.address || null;
  };

  const getPreferredPhone = (phones) => {
    if (!phones || phones.length === 0) return null;
    const preferred = phones.find((p) => p.preference === "preferred");
    return preferred?.number || phones[0]?.number || null;
  };

  const getOfficeLocation = (addresses) => {
    if (!addresses || addresses.length === 0) return null;
    const officeAddr = addresses.find(a => a.type?.category === "business" || a.type?.category === "office");
    const addr = officeAddr || addresses[0];
    if (addr) {
      const building = addr.addressLines?.[0] || "";
      const room = addr.addressLines?.[1] || "";
      return building && room ? `${building} ${room}` : building || room || null;
    }
    return null;
  };

  if (loading) {
    return <div style={{ padding: "1.5rem", fontFamily: "Arial, sans-serif" }}>Loading course details...</div>;
  }

  return (
    <div style={{ 
      padding: "1.5rem", 
      fontFamily: "Arial, sans-serif",
      backgroundColor: "#f8f9fa",
      minHeight: "100vh"
    }}>
      <div style={{ 
        display: "flex", 
        gap: "2rem",
        maxWidth: "1400px",
        margin: "0 auto"
      }}>
        {/* LEFT COLUMN - Course Information */}
        <div style={{ flex: "0 0 40%", backgroundColor: "white", padding: "2rem", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          
          {/* Course Title and Schedule */}
          {courseData && (
            <div style={{ marginBottom: "2rem" }}>
              <h1 style={{ 
                fontSize: "1.5rem", 
                fontWeight: "bold", 
                margin: "0 0 0.5rem 0",
                color: "#333"
              }}>
                {courseData.subjectAbbreviation || "AMH"} {courseData.courseNumber || "2010"} {courseData.courseName || "United States History I"}
              </h1>
              
              {/* Use the merged component for schedule and location */}
              <ScheduleLocationInfo 
                instructionalEvents={instructionalEvents} 
                courseData={courseData}
              />
            </div>
          )}

          {/* Display Section Information
          {courseData.section && (
            <div style={{ marginTop: "1rem", paddingTop: "1rem" }}>
              <h4>Section Details</h4>
              {courseData.section.id && (
                <p>
                  <strong>Section ID:</strong> {courseData.section.id}
                </p>
              )}
              {courseData.section.titles && courseData.section.titles.length > 0 && (
                <div>
                  <strong>Section Titles:</strong>
                  <ul style={{ marginTop: "0.5rem", paddingLeft: "1.5rem" }}>
                    {courseData.section.titles.map((titleObj, idx) => (
                      <li key={idx}>{titleObj.value || "N/A"}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )} */}

          {/* Display Academic Period Information */}
          {/* {courseData.academicPeriod && (
            <div style={{ marginTop: "1rem", paddingTop: "1rem", marginBottom: "1rem", borderBottom: "1px solid #ddd" }}>
              {courseData.academicPeriod.startOn && courseData.academicPeriod.endOn && (
                <p>
                  <strong>Period Duration:</strong>{" "}
                  {formatDate(courseData.academicPeriod.startOn)} -{" "}
                  {formatDate(courseData.academicPeriod.endOn)}
                </p>
              )}
            </div>
          )} */}

          {/* Instructor Information */}
          <div style={{ marginBottom: "2rem" }}>
            {instructors.length > 0 ? (
              instructors.map(({ node }, index) => {
                const instructor = node.instructor12;
                const name = getPreferredName(instructor?.names);
                const email = getPreferredEmail(instructor?.emails);
                const phone = getPreferredPhone(instructor?.phones);
                const officeLocation = getOfficeLocation(instructor?.addresses);
                
                return (
                  <div key={node.id || index} style={{ fontSize: "0.95rem", lineHeight: "1.8", color: "#333" }}>
                    <div><strong>Instructor:</strong> {name}</div>
                    {email && <div><strong>Email:</strong> {email}</div>}
                    {officeLocation && <div><strong>Office Location:</strong> {officeLocation}</div>}
                    {phone && <div><strong>Office Phone:</strong> {phone}</div>}
                  </div>
                );
              })
            ) : (
              <div style={{ fontSize: "0.95rem", lineHeight: "1.8", color: "#333" }}>
                <div><strong>Instructor:</strong>N/A </div>
                <div><strong>Email:</strong>N/A</div>
                <div><strong>Office Location:</strong> N/A</div>
                <div><strong>Office Phone:</strong> N/A</div>
              </div>
            )}
          </div>

          {/* Start and End Dates */}
          {courseData && (
            <div style={{ fontSize: "0.95rem", lineHeight: "1.8", color: "#333" }}>
              <div><strong>Start Date:</strong> {formatDate(courseData.startOn || courseData.academicPeriod?.startOn)}</div>
              <div><strong>End Date:</strong> {formatDate(courseData.endOn || courseData.academicPeriod?.endOn)}</div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div style={{
              marginTop: "1.5rem",
              padding: "1rem",
              backgroundColor: "#fff3cd",
              border: "1px solid #ffc107",
              borderRadius: "4px",
              color: "#856404",
              fontSize: "0.9rem"
            }}>
              <strong>Note:</strong> {error}
            </div>
          )}

          {/* Back Button */}
          <div style={{ marginTop: "2rem" }}>
            <button
              onClick={() => history.goBack()}
              style={{
                padding: "0.6rem 1.5rem",
                backgroundColor: "#0066cc",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "0.95rem",
                fontWeight: "500"
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = "#0052a3"}
              onMouseOut={(e) => e.target.style.backgroundColor = "#0066cc"}
            >
              ← Back to Classes
            </button>



 <div style={{
          flex: "0 0 60%",
          height: "400px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#fff",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          overflow: "hidden"
        }}>
          <img
            src={campusImage}
            alt="Campus Map"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "fill"
            }}
          />
        </div>

          </div>
        </div>

        {/* RIGHT COLUMN - Campus Map */}
       
      </div>
    </div>
  );
};

export default CoursePage;