import React, { useEffect, useMemo, useState } from "react";
import { useData, useCardControl } from "@ellucian/experience-extension-utils";
import {
  Typography,
  SelectionMenu,
  TextLink,
} from "@ellucian/react-design-system/core";
import PropTypes from "prop-types";

const StudentClassesCard = (props) => {
  const {
    cardInfo: { configuration },
  } = props;
  const { getEthosQuery } = useData();
  const { navigateToPage, setLoadingStatus, setErrorMessage } =
    useCardControl();
  const [sections, setSections] = useState([]);
  const [terms, setTerms] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log(configuration, "configuration");
  }, [configuration]);

  useEffect(() => {
    async function fetchSections() {
      try {
        setLoading(true);
        setLoadingStatus(true);

        const result = await getEthosQuery({
          queryId: "section-registrations",
          properties: { personId: null }, // auto-populated by Experience
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
          (t) => new Date(t.startOn) <= today && new Date(t.endOn) >= today
        );
        setSelectedTerm(currentTerm || sortedTerms[0]);
      } catch (err) {
        setErrorMessage({
          headerMessage: "Error fetching student sections",
          textMessage: err.message,
          iconName: "error",
          iconColor: "red",
        });
      } finally {
        setLoading(false);
        setLoadingStatus(false);
      }
    }

    fetchSections();
  }, [getEthosQuery, setLoadingStatus, setErrorMessage]);

  const sectionsForTerm = useMemo(
    () =>
      sections.filter(
        ({ node }) =>
          node.section16?.reportingAcademicPeriod16?.id === selectedTerm?.id
      ) || [],
    [selectedTerm, sections]
  );

  if (loading) {
    return <p>Loading your classes…</p>;
  }

  if (!sections.length) {
    return <p>No registered sections found.</p>;
  }

  const handleCourseClick = (section) => {
    const course = section?.course16;
    const subject = course?.subject6;
    const academicPeriod = section?.reportingAcademicPeriod16;

    // Store course data in localStorage for the CoursePage
    const courseData = {
      sectionId: section?.id,
      courseName: course?.titles?.[0]?.value || section?.titles?.[0]?.value,
      subjectAbbreviation: subject?.abbreviation || "",
      subjectTitle: subject?.title || "",
      subjectId: subject?.id || "",
      courseId: course?.id || "",
      courseNumber: course?.number || "",
      termTitle: academicPeriod?.title || "",
      termId: academicPeriod?.id || "",
      sectionNumber: section?.number || "",
      sectionCode: section?.code || "",
      startOn: section?.startOn,
      endOn: section?.endOn,
      section: {
        id: section?.id,
        titles: section?.titles || [],
      },
      academicPeriod: {
        id: academicPeriod?.id,
        code: academicPeriod?.code,
        title: academicPeriod?.title,
        startOn: academicPeriod?.startOn,
        endOn: academicPeriod?.endOn,
      },
    };

    localStorage.setItem("selectedCourse", JSON.stringify(courseData));

    // Navigate to course page with sectionId
    navigateToPage({
      route: `Classpageion_canvas_url}`,
    });
  };

  return (
    <div style={{ padding: "1rem", overflowY: "auto", margin: 0 }}>
      {/* Term Selector */}
      <div style={{ marginBottom: "1rem" }}>
        <Typography style={{ fontWeight: "bold", marginRight: "0.5rem" }}>
          Term:
        </Typography>

        <SelectionMenu
          id="term-selector"
          native
          ListItemProps={{
            "aria-label": "Select Term",
            innerHeight: 50,
            outerHeight: 50,
          }}
          onChange={(e) => {
            e.stopPropagation();
            setSelectedTerm(terms.find((t) => t.id === e.target.value));
          }}
          value={selectedTerm?.id}
        >
          {terms.map((term) => (
            <option key={term.id} value={term.id}>
              {term.title}
            </option>
          ))}
        </SelectionMenu>
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

          // Placeholder meeting info
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
                borderBottom: "1px solid #454444ff",
              }}
            >
              {/* Course Title Link */}
              <TextLink
                id={`course-link-${section?.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleCourseClick(section);
                }}
              >
                {title}
              </TextLink>
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

StudentClassesCard.propTypes = {
  cardInfo: PropTypes.object.isRequired,
};

export default StudentClassesCard;