/* eslint-disable react/prop-types */
import React, { useEffect, useState } from "react";
import { usePageControl, useData } from "@ellucian/experience-extension-utils";
import { useLocation, useHistory } from "react-router-dom";
import campusImage from "../assets/image.jpg";

// Component to handle both dynamic and static rendering of schedule and location
const ScheduleLocationInfo = ({ instructionalEvents, courseData, campusDescription }) => {
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
     } 

    if (event.recurrence?.timePeriod) {
      const start = event.recurrence.timePeriod.startOn || "";
      const end = event.recurrence.timePeriod.endOn || "";
      if (start && end) {
        // Extract time from ISO datetime string
        const startTime = new Date(start).toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        });
        const endTime = new Date(end).toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        });
        timeStr = `${startTime} - ${endTime}`;
      }
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
  const staticLocation = courseData?.location || ( `${campusDescription} Campus` );
  
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
            `${campusDescription ? `${campusDescription} Campus` : 'Panama City Campus'}, ${locationData.building} ${locationData.room}` : 
            locationData.building ? 
              `${campusDescription ? `${campusDescription} Campus` : 'Panama City Campus'}, ${locationData.building}` : 
              (campusDescription ? `${campusDescription} Campus` : "Panama City Campus")
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
  const [campusCode, setCampusCode] = useState(null);
  const [campusDescription, setCampusDescription] = useState(null);
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
        
        // Extract and log subject abbreviation and course number
        const subjectCode = parsedData.subjectAbbreviation;
        const courseNumber = parsedData.courseNumber;
        
        console.log("Subject Abbreviation:", subjectCode);
        console.log("Course Number:", courseNumber);
        
        // Debug: Check if section ID matches
        if (parsedData.section?.id && sectionId && parsedData.section.id !== sectionId) {
          console.warn("Section ID mismatch:", {
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

    const fetchCampusCode = async (subjectCode, courseNumber, userId, termCode) => {
      if (!isMounted) return;
      
      try {
        console.log("CAMPUS CODE DEBUG");
        console.log("Fetching campus code with params:", { subjectCode, courseNumber, userId, termCode });

        const queryParams = new URLSearchParams();
        queryParams.append('subjectCode', subjectCode);
        queryParams.append('courseNumber', courseNumber);
        queryParams.append('userId', userId);
        queryParams.append('termCode', termCode);
        queryParams.append('cardId', cardId);
        queryParams.append('ethosAPIKey', "2e5330bd-483a-42c8-925b-d59edf93345f");

        const resource = `GetCampusCode-ServerlessAPI?${queryParams.toString()}`;
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
          console.error("Campus Code API Error:", errorText);
          throw new Error(`HTTP ${response.status}: ${response.statusText || errorText}`);
        }

        const data = await response.json();
        console.log("Campus Code API response:", data);
        
        if (data.errors && data.errors.length > 0) {
          console.error("API returned errors:", data.errors);
          throw new Error(data.errors[0].description || data.errors[0].details || "API error");
        }

        let campusCodeData = null;
        let campusDescriptionData = null;
        
        // Handle different response structures
        if (typeof data === 'string') {
          campusCodeData = data;
        } else if (data.campuscode || data.campusCode) {
          campusCodeData = data.campuscode || data.campusCode;
          campusDescriptionData = data.campusdescription || data.campusDescription;
        } else if (data.data) {
          campusCodeData = data.data.campuscode || data.data.campusCode || data.data;
          campusDescriptionData = data.data.campusdescription || data.data.campusDescription;
        } else if (data.payload) {
          campusCodeData = data.payload.campuscode || data.payload.campusCode || data.payload;
          campusDescriptionData = data.payload.campusdescription || data.payload.campusDescription;
        } else if (data.message) {
          campusCodeData = data.message.campuscode || data.message.campusCode || data.message;
          campusDescriptionData = data.message.campusdescription || data.message.campusDescription;
        }
        
        console.log("Extracted campus code:", campusCodeData);
        console.log("Extracted campus description:", campusDescriptionData);
        
        if (isMounted) {
          setCampusCode(campusCodeData);
          setCampusDescription(campusDescriptionData);
        }

      } catch (err) {
        console.error("Failed to fetch campus code:", err.message);
        console.error("Full error:", err);
        if (isMounted) {
          setCampusCode(null);
        }
      }
    };

    const fetchInstructionalEvents = async (sectionId) => {
      if (!isMounted) return;
      
      try {
        const queryParams = new URLSearchParams();
        queryParams.append('sectionId', sectionId);
        queryParams.append('cardId', cardId);
        queryParams.append('ethosAPIKey', "2e5330bd-483a-42c8-925b-d59edf93345f");

        const resource = `GetInstructionalEvents-ServerlessAPI?${queryParams.toString()}`;
        
        const options = {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        };

        const response = await authenticatedEthosFetch(resource, options);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Instructional Events API Error:", errorText);
          throw new Error(`HTTP ${response.status}: ${response.statusText || errorText}`);
        }

        const data = await response.json();
        
        if (data.errors && data.errors.length > 0) {
          console.error("API returned errors:", data.errors);
          throw new Error(data.errors[0].description || data.errors[0].details || "API error");
        }

        let events = [];
        
        if (Array.isArray(data) && data.length > 0) {
          events = data;
        } else if (data.data && Array.isArray(data.data)) {
          events = data.data;
        } else if (data.payload && Array.isArray(data.payload)) {
          events = data.payload;
        } else if (data.instructionalEvents && Array.isArray(data.instructionalEvents)) {
          events = data.instructionalEvents;
        } else if (data.message && Array.isArray(data.message)) {
          events = data.message;
        } else {
          console.warn("Could not find events in any known structure. Full response:", JSON.stringify(data, null, 2));
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
        const queryParams = new URLSearchParams();
        queryParams.append('sectionId', sectionId);
        queryParams.append('cardId', cardId);
        queryParams.append('ethosApiKey', "2e5330bd-483a-42c8-925b-d59edf93345f");

        const resource = `GetSectionInstructors-ServerlessAPI?${queryParams.toString()}`;
        
        const options = {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        };

        const response = await authenticatedEthosFetch(resource, options);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Section Instructors API Error:", errorText);
          console.error("Response status:", response.status);
          console.error("Response statusText:", response.statusText);
          
          throw new Error(`Failed to fetch instructors: HTTP ${response.status} - ${errorText || response.statusText}`);
        }

        const data = await response.json();
        
        if (data.errors && data.errors.length > 0) {
          console.error("API returned errors:", data.errors);
          throw new Error(data.errors[0].description || data.errors[0].details || "API error");
        }

        let instructorData = [];
        
        if (Array.isArray(data)) {
          instructorData = data;
        } else if (data.data && Array.isArray(data.data)) {
          instructorData = data.data;
        } else if (data.payload && Array.isArray(data.payload)) {
          instructorData = data.payload;
        } else if (data.message && Array.isArray(data.message)) {
          instructorData = data.message;
        } else if (data.instructors && Array.isArray(data.instructors)) {
          instructorData = data.instructors;
        } else {
          console.warn("Could not find instructors in any known structure. Full response:", JSON.stringify(data, null, 2));
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

        const instructorsWithDetails = await Promise.all(
          mappedInstructors.map(async (instructor) => {
            try {
              const personId = instructor.node.instructorId;
              
              if (!personId) {
                console.warn("No personId found for instructor:", instructor);
                return instructor;
              }
              
              const personQueryParams = new URLSearchParams();
              personQueryParams.append('personId', personId);
              personQueryParams.append('cardId', cardId);
              personQueryParams.append('ethosApiKey', "2e5330bd-483a-42c8-925b-d59edf93345f");
              
              const personResource = `GetPersonDetails-ServerlessAPI?${personQueryParams.toString()}`;
              
              const personResponse = await authenticatedEthosFetch(personResource, {
                method: 'GET',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                },
              });
              
              if (!personResponse.ok) {
                const errorText = await personResponse.text();
                console.error("Person Details API Error:", errorText);
                console.error("Failed to fetch person details for:", personId);
                return instructor;
              }
              
              const personData = await personResponse.json();
              
              let person = null;
              
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
          console.log("All instructor details fetched. Total count:", instructorsWithDetails.length);
          setInstructors(instructorsWithDetails);
        }

      } catch (err) {
        console.error("INSTRUCTOR FETCH ERROR");
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
      
      // Fetch campus code if we have the required data
      if (courseData?.subjectAbbreviation && courseData?.courseNumber) {
        // Get userId - replace with actual userId retrieval method
        const userId = "EMCQUE";
        
        // Get term code from localStorage
        const storedTerm = localStorage.getItem("selectedTerm");
        if (storedTerm) {
          try {
            const termData = JSON.parse(storedTerm);
            const termCode = termData.code;
            
            if (termCode) {
              fetchCampusCode(
                courseData.subjectAbbreviation,
                courseData.courseNumber,
                userId,
                termCode
              );
            }
          } catch (err) {
            console.error("Error parsing selectedTerm from localStorage:", err);
          }
        }
      }
    } else {
      setError("No section ID provided");
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [authenticatedEthosFetch, sectionId, cardId, courseData]);

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
        gap: "1rem",
        maxWidth: "1400px",
        margin: "0 auto"
      }}>
        {/* LEFT COLUMN - Course Information */}
        <div style={{ flex: "0 0 40%", padding: "2rem" }}>
          
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
                campusDescription={campusDescription}
              />
            </div>
          )}

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
                <div><strong>Instructor:</strong> N/A</div>
                <div><strong>Email:</strong> N/A</div>
                <div><strong>Office Location:</strong> N/A</div>
                <div><strong>Office Phone:</strong> N/A</div>
              </div>
            )}
          </div>

          {/* Start and End Dates */}
          {courseData && (
            <div style={{ fontSize: "0.95rem", lineHeight: "1.8", color: "#333", marginBottom: "1rem" }}>
              <div><strong>Start Date:</strong> {formatDate(courseData.startOn || courseData.academicPeriod?.startOn)}</div>
              <div><strong>End Date:</strong> {formatDate(courseData.endOn || courseData.academicPeriod?.endOn)}</div>
            </div>
          )}

          {/* Campus Code */}
          {campusCode && (
            <div style={{ fontSize: "0.95rem", lineHeight: "1.8", color: "#333" }}>
              {/* <div><strong>Campus Code:</strong> {campusCode}</div> */}
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
              onFocus={(e) => e.target.style.backgroundColor = "#0052a3"}
              onMouseOut={(e) => e.target.style.backgroundColor = "#0066cc"}
              onBlur={(e) => e.target.style.backgroundColor = "#0066cc"}
            >
              ← Back to Classes
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN - Campus Map */}
        <div style={{
          flex: "0 0 60%",
          height: "400px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
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
  );
};

export default CoursePage;