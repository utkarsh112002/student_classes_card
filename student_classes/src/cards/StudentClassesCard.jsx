import { withStyles } from '@ellucian/react-design-system/core/styles';
import { spacing40 } from '@ellucian/react-design-system/core/styles/tokens';
import { Typography, TextLink } from '@ellucian/react-design-system/core';
import PropTypes from 'prop-types';
// import {  useDataQuery } from '@ellucian/experience-extension-extras';
import { useData } from "@ellucian/experience-extension-utils"
import React, { useEffect } from 'react';

const styles = () => ({
    card: {
        marginTop: 0,
        marginRight: spacing40,
        marginBottom: 0,
        marginLeft: spacing40
    }
});

const StudentClassesCard = async (props) => {
    const { getEthosQuery } = useData();
    const { classes } = props;
    // const { isError, isLoading, isRefreshing } = useDataQuery(resource);
    // const resource = 'section-registrations';
    const result = await getEthosQuery({queryId: 'section-registrations'});

    useEffect(() => {
        console.log(result)
    }, [result])
    return (
        <div className={classes.card}>
            <Typography variant="h2">
                Hello StudentClasses World
            </Typography>
            <Typography>
                <span>
                    For sample extensions, visit the Ellucian Developer
                </span>
                <TextLink href="https://github.com/ellucian-developer/experience-extension-sdk-samples" target="_blank">
                     GitHub
                </TextLink>
            </Typography>
        </div>
    );
};

StudentClassesCard.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(StudentClassesCard);