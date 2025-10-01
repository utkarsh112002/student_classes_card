module.exports = {
  name: "StudentClasses",
  publisher: "Sample",
  cards: [
    {
      type: "StudentClassesCard",
      source: "./src/cards/StudentClassesCard",
      title: "StudentClasses Card",
      displayCardType: "StudentClasses Card",
      description:
        "This is an introductory card to the Ellucian Experience SDK",
      queries: {
        "section-registrations": [
          {
            resourceVersions: {
              sectionRegistrations: { min: 6 },
            },
            query: `query registrantSectionsAndAcademicPeriods(registrantId: ID) {
            sectionRegistration : sectionRegistrations16(
      filter: { registrant12: { id: { EQ: $registrantId } } }
    ) {
      edges {
        node {
          id
          registrant12 {
            id
          }
          credit {
            measure
            registrationCredit
          }
          status {
            registrationStatus
          }
          section16 {
            id
            titles {
              value
              type1 {
                id
                title
                code
              }
            }
            descriptions {
              value
            }
            code
            number
            startOn
            endOn
            reportingAcademicPeriod16 {
              id
              code
              title
              startOn
              endOn
            }
            course16 {
              id
              number
              titles {
                value
              }
              subject6 {
                id
                abbreviation
                title
              }
            }
          }
        }
      }
    }
  }
`,
          },
        ],
      },
      // pageRoute: {
      //     route: '/',
      //     excludeClickSelectors: ['a']
      // }
    },
  ],
  page: {
    source: "./src/page/router.jsx",
  },
};
