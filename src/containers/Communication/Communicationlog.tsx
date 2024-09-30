import * as React from 'react';
import { useState, useEffect } from "react";
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { fetchLogsByUser, deleteAllLogsByUser } from "../../services/communication.service";
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material"; // Import Material-UI components
import styles from "./Communication.css";
import HistoryIcon from '@mui/icons-material/History';
import { toast } from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";

type CommunicationlogProps = {
    userId: string;
    moduleType: string;
};

interface LogData {
    text: string;
    timestamp: string;
    log_id: number;
}

const Communicationlog: React.FC<CommunicationlogProps> = ({ userId, moduleType }) => {
    const [logs, setLogs] = useState<LogData[]>([]);

    useEffect(() => {
        const getLogs = async () => {
            try {
                const getData = {
                    module: moduleType,
                    user_id: userId,
                }
                const { data } = await fetchLogsByUser(getData);
                setLogs(data);
            } catch (error) {
                console.error("Error fetching logs:", error);
            }
        };

        getLogs();
    }, [moduleType, userId]);

    return (
        <List>
    {logs
        .sort((a, b) => b.log_id - a.log_id) // Sort logs by descending log_id
        .map((log) => (
            <ListItem key={log.log_id} disablePadding className="log-item">
                <ListItemButton>
                    <ListItemIcon>
                        {log.log_id}
                    </ListItemIcon>
                    <ListItemText primary={`"${log.text}"`} secondary={log.timestamp} />
                </ListItemButton>
            </ListItem>
        ))}
</List>

    );
};

type Anchor = 'right';

const AnchorTemporaryDrawer: React.FC<CommunicationlogProps> = ({ userId, moduleType }) => {
    const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false); // State for delete confirmation dialog
    const [state, setState] = useState({ right: false });
    const { t, i18n } = useTranslation();

    const confirmDeleteLogs = async () => {
        try {
            const delData = {
                module: moduleType,
            }
            await deleteAllLogsByUser(userId, delData);
            toast.success("History logs cleared successfully");
        } catch (error) {
            toast.error("Error deleting logs");
        } finally {
            setOpenDeleteConfirm(false); // Close the delete confirmation dialog
            setState({ right: false }); // Close the drawer
        }
    };

    const toggleDrawer = (anchor: Anchor, open: boolean) => (
        event: React.KeyboardEvent | React.MouseEvent
    ) => {
        if (
            event.type === 'keydown' &&
            ((event as React.KeyboardEvent).key === 'Tab' ||
                (event as React.KeyboardEvent).key === 'Shift')
        ) {
            return;
        }

        setState({ ...state, [anchor]: open });
    };

    const list = (anchor: Anchor) => (
        // @ts-ignore
        <Box className="log-bg" sx={{ width: 250 }}role="presentation">
            <div className="log-top">
            <br/>
            <button onClick={() => setOpenDeleteConfirm(true)} className="dltLogBtn"><FontAwesomeIcon className="dltLogsIcon" icon={faTrash} /></button>
            <i className="fa fa-close closeFa" onClick={toggleDrawer(anchor, false)}></i>

            <h3 className="logHeader">{t("communicationLog")}</h3>
            <br/>

            </div>
            <Dialog className="dialog_overlay" open={openDeleteConfirm} onClose={() => setOpenDeleteConfirm(false)}>
                <DialogContent className="dialog_content2">
                    <DialogTitle className="dialog_title">{t("confirmClear")}</DialogTitle>
                    <DialogContentText className="dialog_description2">
                    {t("clearAllLogs")}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <div className="buttonsConfirmation">
                        <button
                            className="noButton"
                            onClick={() => setOpenDeleteConfirm(false)}>{t("no_btn")}</button>
                        <button
                            className="yesButton"
                            onClick={confirmDeleteLogs}>{t("yes_btn")}</button>
                    </div>
                </DialogActions>
            </Dialog>
            <Communicationlog userId={userId} moduleType={moduleType} />
        </Box>
    );

    return (
        <div>
            <React.Fragment key={'right'}>
                <button onClick={toggleDrawer('right', true)} className="communicationlog-btn" title="Communication log">
                    {/* <img
                        src="./images/history.png"
                        className="communicationlog-img"
                        alt="History"
                    /> */}
                    <ListItemIcon className="communicationlog-icon">
                        <HistoryIcon className="communicationlog-img" />
                    </ListItemIcon>
                </button>
                <Drawer
                    anchor={'right'}
                    open={state['right']}
                    onClose={toggleDrawer('right', false)}
                >
                    {list('right')}
                </Drawer>
            </React.Fragment>
        </div>
    );
};

export default AnchorTemporaryDrawer;