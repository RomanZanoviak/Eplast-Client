import Item from "antd/lib/list/Item";
import ClubAdmin from "../../../models/Club/ClubAdmin";
import ClubMember from "../../../models/Club/ClubMember";

export const getTableAdmins = (admins: ClubAdmin[]) => {
    return admins.map((admin: ClubAdmin) => ({
        key: admin.user.id,
        name: `${admin.user.firstName} ${admin.user.lastName}`,
        type: admin.adminType.adminTypeName,
        degree:
            admin?.user?.clubReportPlastDegrees !== null
                ? admin.user?.clubReportPlastDegrees?.plastDegree?.name
                    ? `${admin.user.clubReportPlastDegrees.plastDegree.name}`
                    : "_"
                : admin.user?.userPlastDegrees?.plastDegree?.name
                    ? `${admin.user.userPlastDegrees?.plastDegree.name}`
                    : "_",
        userCity:
            admin.user.clubReportCities !== null
                ? admin.user.clubReportCities?.city?.name
                    ? `${admin.user.clubReportCities?.city?.name}`
                    : "_"
                : admin.user.cityMembers.length
                    ? admin.user.cityMembers[0].city.name
                    : "_",
        email: admin.user.email ? `${admin.user.email}` : "_",
        phoneNumber: admin.user.phoneNumber ? `${admin.user.phoneNumber}` : "_",
    }));
};

export const getTableMembers = (members: ClubMember[]) => {
    return members.map((member: ClubMember) => ({
        key: member.user.id,
        name: `${member.user.firstName} ${member.user.lastName}`,
        degree:
            member.user.clubReportPlastDegrees !== null
                ? member.user.clubReportPlastDegrees?.plastDegree?.name
                    ? `${member.user.clubReportPlastDegrees.plastDegree.name}`
                    : "_"
                : member.user.userPlastDegrees?.plastDegree?.name
                    ? `${member.user.userPlastDegrees?.plastDegree.name}`
                    : "_",
        userCity:
            member.user.clubReportCities !== null
                ? member.user.clubReportCities?.city?.name
                    ? `${member.user.clubReportCities?.city?.name}`
                    : "_"
                : member.user.cityMembers.length
                    ? member.user.cityMembers[0].city.name
                    : "_",
        type: member.user.userRole,
        email: member.user.email ? `${member.user.email}` : "_",
        phoneNumber: member.user.phoneNumber ? `${member.user.phoneNumber}` : "_",
    }));
};

export const administrationsColumns = [
    {
        title: "?????????, ????????????????",
        dataIndex: "name",
        key: "name",
    },
    {
        title: "????????????",
        dataIndex: "type",
        key: "type",
    },
    {
        title: "??????????????",
        dataIndex: "degree",
        key: "degree",
        width: "100",
    },
    {
        title: "??????????????",
        dataIndex: "userCity",
        key: "userCity",
    },
    {
        title: "???????????????????? ??????????",
        dataIndex: "email",
        key: "email",
    },
    {
        title: "??????????????",
        dataIndex: "phoneNumber",
        key: "phoneNumber",
    },
];

export const followersColumns = [
    {
        title: "?????????, ????????????????",
        dataIndex: "name",
        key: "name",
    },
    {
        title: "??????????????",
        dataIndex: "degree",
        key: "degree",
        width: "100",
    },
    {
        title: "??????????????",
        dataIndex: "userCity",
        key: "userCity",
    },
    {
        title: "???????????????????? ??????????",
        dataIndex: "email",
        key: "email",
    },
    {
        title: "??????????????",
        dataIndex: "phoneNumber",
        key: "phoneNumber",
    },
];
