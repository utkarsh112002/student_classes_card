/* eslint-disable no-unused-vars */

/* eslint-disable react-hooks/exhaustive-deps */

import React, { useEffect, useState } from "react";

import { useData, usePageControl } from "@ellucian/experience-extension-utils";

import { SelectionMenu, TextLink } from "@ellucian/react-design-system/core";

import { useLocation, useHistory } from "react-router-dom";

const ClassesPage = () => {
  const defaultTermId = null;

  const { getEthosQuery } = useData();

  const { setPageTitle } = usePageControl();

  const [sections, setSections] = useState([]);

  const [terms, setTerms] = useState([]);

  const [selectedTerm, setSelectedTerm] = useState(null);

  const [loading, setLoading] = useState(true);

  const [gradesWithSectionArr, setGradesWithSectionArr] = useState([]);

  const history = useHistory();

  const { search } = useLocation();

  const searchParams = new URLSearchParams(search);

  const selectedTermQueryValue = searchParams.get("selectedTerm");

  const extension_canvas_url = searchParams.get("extension_canvas_url");

  useEffect(() => {
    setPageTitle("Classes");
  }, [setPageTitle]);

  // Fetch grades first

  const fetchGrades = async () => {
    try {
      setLoading(true);

      const result = await getEthosQuery({
        queryId: "student-grades",

        properties: { personId: null },
      });

      const grades =
        result?.data?.studentTranscriptGrades1?.edges?.map((el) => ({
          sectionId: el?.node?.course?.section16?.id || "",

          grade: el?.node?.grade6?.grade?.value || "",
        })) || [];

      console.log("Fetched grades:", grades);

      setGradesWithSectionArr(grades);

      // Fetch sections once grades are available

      await fetchSections(grades);
    } catch (error) {
      console.error("Error fetching grades:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch section registrations after grades are available

  const fetchSections = async (gradeArr) => {
    try {
      const result = await getEthosQuery({
        queryId: "section-registrations",

        properties: { personId: null },
      });

      const registrations =
        result?.data?.sectionRegistration?.edges?.map((el) => {
          const sectionId = el?.node?.section16?.id;

          const gradeObj = gradeArr.find((g) => g.sectionId === sectionId);

          return {
            ...el,

            grade: gradeObj?.grade || "",
          };
        }) || [];

      setSections(registrations);

      // Build term list

      const termMap = {};

      registrations.forEach(({ node }) => {
        const term = node?.section16?.reportingAcademicPeriod16;

        if (term && !termMap[term.id]) termMap[term.id] = term;
      });

      const sortedTerms = Object.values(termMap).sort(
        (a, b) => new Date(b.startOn) - new Date(a.startOn)
      );

      setTerms(sortedTerms);

      // Apply selected term from query or default

      const termFromQuery = sortedTerms.find(
        (t) => t.id === selectedTermQueryValue
      );

      if (termFromQuery) {
        setSelectedTerm(termFromQuery);
      } else {
        const current = sortedTerms.find((t) => t.id === defaultTermId);

        setSelectedTerm(current || sortedTerms[0]);
      }
    } catch (err) {
      console.error("Error fetching sections:", err);
    }
  };

  // Run fetch on mount

  useEffect(() => {
    fetchGrades();

    return () => {
      setGradesWithSectionArr([]);

      setSections([]);

      setTerms([]);

      setLoading(false);
    };
  }, [getEthosQuery]);

  if (loading) return <p>Loading Classes…</p>;

  if (!sections.length) return <p>No registered classes found.</p>;

  const sectionsForTerm = sections.filter(
    ({ node }) =>
      node?.section16?.reportingAcademicPeriod16?.id === selectedTerm?.id
  );

  const formatMeetings = (section) => {
    if (!section) return "WEB";

    const meetingTime =
      section?.startOn && section?.endOn
        ? `${new Date(section.startOn).toLocaleDateString()} - ${new Date(
            section.endOn
          ).toLocaleDateString()}`
        : "WEB";

    return meetingTime;
  };

  const gradeBadge = (grade) => {
    if (!grade) return null;

    return (
      <div
        style={{
          minWidth: "40px",

          height: "40px",

          borderRadius: "50%",

          background: "#f5f5f5",

          display: "flex",

          alignItems: "center",

          justifyContent: "center",

          fontWeight: "bold",

          fontSize: "0.9rem",

          color: "#333",
        }}
      >
        {grade}
      </div>
    );
  };

  return (
    <div style={{ padding: "1rem" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",

          justifyContent: "space-between",

          marginBottom: "1rem",
        }}
      >
        <SelectionMenu
          id="term-selector"
          native
          ListItemProps={{ "aria-label": "Select Term" }}
          onChange={(e) => {
            e.stopPropagation();

            setSelectedTerm(terms.find((t) => t.id === e.target.value));
          }}
          value={selectedTerm?.id || ""}
        >
          {terms.map((term) => (
            <option key={term.id} value={term.id}>
              {term.title}
            </option>
          ))}
        </SelectionMenu>

        <TextLink
          id={`EllucianEnabled`}
          href={
            extension_canvas_url
              ? extension_canvas_url
              : "https://www.ellucian.com/"
          }
          target={"__blank"}
        >
          Canvas →
        </TextLink>
      </div>

      {/* Course list */}
      <div>
        {sectionsForTerm.map(({ node, grade }, index) => {
          const section = node?.section16;

          const course = section?.course16;

          const subject = course?.subject6?.abbreviation || "";

          const number = course?.number || "";

          const academicPeriod = section?.reportingAcademicPeriod16;

          const title =
            course?.titles?.[0]?.value || section?.titles?.[0]?.value;

          const courseName = `${subject} ${number} ${title}`;

          const meetingTimes = formatMeetings(section);

          const location = section?.campus16
            ? `${section.campus16.title}, ${section.building16?.title || ""} ${
                section.room16?.title || ""
              }`
            : "";

          const handleClick = () => {
            // Store complete course information including academic period and section details

            const courseData = {
              courseId: course?.id || "",

              courseName: title || "",

              courseNumber: number || "",

              courseTitle: course?.titles?.[0]?.value || "",

              subjectId: course?.subject6?.id || "",

              subjectAbbreviation: subject || "",

              subjectTitle: course?.subject6?.title || "",

              sectionId: section?.id || "",

              sectionCode: section?.code || "",

              sectionNumber: section?.number || "",

              termId: selectedTerm?.id || "",

              termTitle: selectedTerm?.title || "",

              startOn: section?.startOn || null,

              endOn: section?.endOn || null,

              // Adding academic period data

              academicPeriod: {
                id: academicPeriod?.id || "",

                code: academicPeriod?.code || "",

                title: academicPeriod?.title || "",

                startOn: academicPeriod?.startOn || null,

                endOn: academicPeriod?.endOn || null,
              },

              // Adding section details

              section: {
                id: section?.id || "",

                titles: section?.titles || [],
              },
            };

            localStorage.setItem("selectedCourse", JSON.stringify(courseData));
            localStorage.setItem("selectedTerm", JSON.stringify(selectedTerm));

            console.log("navigation started");

            // Navigate to coursePage - FIXED: Use extension_canvas_url from searchParams

            const canvasUrlParam = extension_canvas_url
              ? `&extension_canvas_url=${extension_canvas_url}`
              : "";

            history.push(
              `/coursepage?sectionId=${section?.id}${canvasUrlParam}`
            );
          };

          return (
            <div
              key={section?.id}
              style={{
                display: "flex",

                justifyContent: "space-between",

                alignItems: "center",

                padding: "0.75rem 0",

                borderBottom: "1px solid #eee",
              }}
            >
              <div>
                <TextLink id={`EllucianEnabled-${index}`} onClick={handleClick}>
                  {courseName}
                </TextLink>
                <div style={{ fontSize: "0.85rem", color: "#555" }}>
                  {meetingTimes}
                </div>

                {location && (
                  <div style={{ fontSize: "0.85rem", color: "#777" }}>
                    {location}
                  </div>
                )}
              </div>

              {gradeBadge(grade)}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ClassesPage;
