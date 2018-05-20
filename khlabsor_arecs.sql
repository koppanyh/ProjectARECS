-- phpMyAdmin SQL Dump
-- version 4.7.7
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: May 19, 2018 at 11:31 PM
-- Server version: 10.1.32-MariaDB
-- PHP Version: 5.6.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `khlabsor_arecs`
--

-- --------------------------------------------------------

--
-- Table structure for table `daydb`
--

CREATE TABLE `daydb` (
  `did` int(5) NOT NULL,
  `uid` int(5) NOT NULL,
  `day` date NOT NULL,
  `tstart` time(6) NOT NULL,
  `tend` time(6) DEFAULT NULL,
  `hours` float NOT NULL DEFAULT '0'
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

--
-- Dumping data for table `daydb`
--

INSERT INTO `daydb` (`did`, `uid`, `day`, `tstart`, `tend`, `hours`) VALUES
(1, 1, '2018-04-07', '10:40:00.000000', '23:10:00.000000', 12.5),
(2, 1, '2018-04-07', '23:10:00.000000', '23:23:00.000000', 0.21667),
(3, 1, '2018-04-09', '15:13:00.000000', '20:26:00.000000', 5.21667),
(4, 1, '2018-04-10', '13:51:00.000000', '14:50:00.000000', 0.98333),
(5, 1, '2018-04-12', '11:50:00.000000', '19:36:00.000000', 7.76667),
(6, 1, '2018-04-13', '11:51:00.000000', '22:00:00.000000', 10.15),
(7, 1, '2018-04-15', '15:45:00.000000', '22:29:00.000000', 6.73333),
(8, 1, '2018-04-16', '14:53:00.000000', '20:34:00.000000', 5.68333),
(9, 1, '2018-04-19', '18:15:00.000000', '20:15:00.000000', 2),
(10, 1, '2018-04-20', '12:55:00.000000', '21:00:00.000000', 8.08333),
(11, 1, '2018-04-21', '11:20:00.000000', '23:46:00.000000', 12.4333),
(12, 3, '2018-04-21', '12:23:00.000000', '16:39:00.000000', 4.26667),
(13, 1, '2018-04-22', '10:04:00.000000', '15:01:00.000000', 4.95),
(14, 1, '2018-04-23', '15:15:00.000000', '21:16:00.000000', 6.01667),
(15, 1, '2018-04-24', '16:33:00.000000', '17:05:00.000000', 0.533333),
(16, 1, '2018-04-25', '18:10:00.000000', '19:16:00.000000', 1.1),
(17, 1, '2018-04-26', '18:32:00.000000', '20:27:00.000000', 1.91667),
(18, 1, '2018-04-27', '14:58:00.000000', '20:26:00.000000', 5.46667),
(19, 1, '2018-04-28', '14:21:00.000000', '21:52:00.000000', 7.51667),
(20, 1, '2018-04-30', '15:35:00.000000', '19:10:00.000000', 3.58333),
(21, 1, '2018-05-04', '14:00:00.000000', '16:14:00.000000', 2.23333),
(22, 1, '2018-05-07', '15:26:00.000000', '20:55:00.000000', 5.48333),
(23, 1, '2018-05-13', '16:39:00.000000', '22:11:00.000000', 5.53333),
(24, 1, '2018-05-14', '15:36:00.000000', '19:00:00.000000', 3.4),
(25, 1, '2018-05-15', '16:36:00.000000', '17:37:00.000000', 1.01667),
(26, 1, '2018-05-17', '18:14:00.000000', '20:11:00.000000', 1.95);

-- --------------------------------------------------------

--
-- Table structure for table `projdb`
--

CREATE TABLE `projdb` (
  `pid` int(5) NOT NULL,
  `title` varchar(256) CHARACTER SET utf8 NOT NULL,
  `description` varchar(1024) CHARACTER SET utf8 NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

--
-- Dumping data for table `projdb`
--

INSERT INTO `projdb` (`pid`, `title`, `description`, `active`) VALUES
(1, 'Siemens', 'Work done for Siemens', 1),
(2, 'KMC Controls', 'Work done for KCM Controls', 0),
(3, 'EasyIO', 'Work done for EasyIO', 1);

-- --------------------------------------------------------

--
-- Table structure for table `rfiddb`
--

CREATE TABLE `rfiddb` (
  `rid` int(5) NOT NULL,
  `uid` int(5) NOT NULL,
  `sid` int(5) NOT NULL,
  `day` date NOT NULL,
  `time` time NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

--
-- Dumping data for table `rfiddb`
--

INSERT INTO `rfiddb` (`rid`, `uid`, `sid`, `day`, `time`) VALUES
(1, 3, 1, '2018-04-21', '12:23:00'),
(2, 1, 1, '2018-04-21', '12:23:00'),
(3, 3, 1, '2018-04-21', '12:24:00'),
(4, 3, 1, '2018-04-21', '12:25:00'),
(5, 1, 1, '2018-04-21', '12:25:00'),
(6, 3, 1, '2018-04-21', '16:39:00'),
(7, 1, 1, '2018-04-21', '23:46:00'),
(8, 1, 1, '2018-04-22', '10:04:00'),
(9, 1, 1, '2018-04-22', '15:01:00'),
(10, 1, 1, '2018-04-28', '14:21:00'),
(11, 1, 1, '2018-04-28', '15:10:00'),
(12, 1, 1, '2018-04-28', '17:23:00'),
(13, 1, 1, '2018-04-28', '21:01:00'),
(14, 1, 1, '2018-05-13', '16:39:00');

-- --------------------------------------------------------

--
-- Table structure for table `scannerdb`
--

CREATE TABLE `scannerdb` (
  `sid` int(5) NOT NULL,
  `devid` varchar(32) CHARACTER SET ascii NOT NULL,
  `name` varchar(32) CHARACTER SET utf8 NOT NULL,
  `location` varchar(128) CHARACTER SET utf8 NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

--
-- Dumping data for table `scannerdb`
--

INSERT INTO `scannerdb` (`sid`, `devid`, `name`, `location`) VALUES
(1, '4C071EA4AE30', 'Node 0', 'Test node in the test room');

-- --------------------------------------------------------

--
-- Table structure for table `userdb`
--

CREATE TABLE `userdb` (
  `uid` int(5) NOT NULL,
  `email` varchar(256) CHARACTER SET utf8 NOT NULL,
  `salt` varchar(32) CHARACTER SET ascii NOT NULL,
  `hashpw` varchar(128) CHARACTER SET ascii NOT NULL,
  `fname` varchar(32) COLLATE utf8_unicode_ci NOT NULL,
  `lname` varchar(32) COLLATE utf8_unicode_ci NOT NULL,
  `admin` tinyint(1) NOT NULL DEFAULT '0',
  `wage` float NOT NULL DEFAULT '0',
  `days` varchar(512) COLLATE utf8_unicode_ci NOT NULL DEFAULT '{"0":[0,"00:00"],"1":[8,"09:00"],"2":[8,"09:00"],"3":[8,"09:00"],"4":[8,"09:00"],"5":[8,"09:00"],"6":[0,"00:00"]}',
  `picture` varchar(256) COLLATE utf8_unicode_ci NOT NULL DEFAULT 'user.png',
  `rfid` varchar(20) CHARACTER SET ascii NOT NULL DEFAULT '00000000000000000000'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `userdb`
--

INSERT INTO `userdb` (`uid`, `email`, `salt`, `hashpw`, `fname`, `lname`, `admin`, `wage`, `days`, `picture`, `rfid`) VALUES
(1, 'koppanyh@j2inn.com', '4a9216297446f0ccd048937681763f61', '73aee64b104b2d9c2f1143bd3b6dca4b6336806f38dc8d0037a9bdf5974a16d9251a8a67684bf09c9969ecfe7b7eba5d2119ab8d9e382b80edf49b15202bc39f', 'Koppany', 'Horvath', 1, 15.2, '{\"0\":[0,\"00:00\"],\"1\":[5,\"09:00\"],\"2\":[8,\"09:00\"],\"3\":[10,\"09:00\"],\"4\":[8,\"09:00\"],\"5\":[0,\"00:00\"],\"6\":[0,\"00:00\"]}', 'koppanyh.png', '508D7B19000000000000'),
(2, 'mikew@j2inn.com', '4620f5c43fd9ad2bd8295e11adb0138c', '5cad53514ebf59d90982c912b47e551da8a8ffa3207e43b5846e56cfea8e269c0d5031b61dfc964139777153c340e0b3fa3dc8a0a8e4b18bf1653a73f0966f1d', 'Michael', 'Whalen', 1, -2360.36, '{\"0\":[0,\"00:00\"],\"1\":[8,\"09:00\"],\"2\":[8,\"09:00\"],\"3\":[8,\"09:00\"],\"4\":[8,\"09:00\"],\"5\":[8,\"09:00\"],\"6\":[0,\"00:00\"]}', 'mikew.jpg', '00000000000000000000'),
(3, 'andrewt@j2inn.com', '9739877ef9c4e0f32916beb903c3c53a', 'bcd93df0f4f9d44522be00a452068a2c000e9f29ffe6972d09de5fa1c255e0a8eb22a069c628e7affdb8fb4b149c4748a61922ae90abde3aec1fd8688398ab1e', 'Andrew', 'Tuma', 0, -1243, '{\"0\":[0,\"00:00\"],\"1\":[8,\"09:00\"],\"2\":[8,\"09:00\"],\"3\":[8,\"09:00\"],\"4\":[8,\"09:00\"],\"5\":[8,\"09:00\"],\"6\":[0,\"00:00\"]}', 'user.png', '7ED14949000000000000');

-- --------------------------------------------------------

--
-- Table structure for table `workdb`
--

CREATE TABLE `workdb` (
  `wid` int(5) NOT NULL,
  `uid` int(5) NOT NULL,
  `did` int(5) NOT NULL,
  `pid` int(5) NOT NULL,
  `description` varchar(1024) CHARACTER SET utf8 NOT NULL,
  `tstart` time(6) NOT NULL,
  `tend` time(6) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

--
-- Dumping data for table `workdb`
--

INSERT INTO `workdb` (`wid`, `uid`, `did`, `pid`, `description`, `tstart`, `tend`) VALUES
(1, 1, 1, 0, 'Worked on the thing', '10:45:00.000000', '16:14:00.000000'),
(2, 1, 1, 2, 'hello world', '17:25:00.000000', '12:00:00.000000'),
(3, 1, 1, 1, 'cheese cake', '17:25:00.000000', '17:25:00.000000'),
(4, 1, 1, 0, '3d printing and dish washing', '18:47:00.000000', '19:47:00.000000'),
(5, 1, 2, 3, 'testing the clocking in and out features', '23:11:00.000000', '23:13:00.000000'),
(6, 1, 2, 0, 'made the clocking feature work', '23:13:00.000000', '23:22:00.000000'),
(7, 1, 3, 0, 'presented senior project', '15:11:00.000000', '15:14:00.000000'),
(8, 1, 3, 0, 'fixed bug in clockin page', '18:00:00.000000', '18:20:00.000000'),
(9, 1, 3, 0, 'made estimated hours work on clockin page', '18:22:00.000000', '19:22:00.000000'),
(10, 1, 5, 1, 'did cool stuff', '13:51:00.000000', '13:51:00.000000'),
(11, 1, 5, 1, 'ate lunch', '12:18:00.000000', '13:18:00.000000'),
(12, 1, 5, 0, 'coding session with Rochelle, best practices', '10:51:00.000000', '12:19:00.000000'),
(13, 1, 5, 0, 'worked on user form styling', '19:47:00.000000', '20:47:00.000000'),
(14, 1, 6, 0, 'desc test', '20:45:00.000000', '20:48:00.000000'),
(15, 1, 6, 0, 'worked on fixing bugs and making things work', '20:00:00.000000', '20:09:00.000000'),
(16, 1, 6, 2, 'fixed the add description bug', '14:10:00.000000', '14:18:00.000000'),
(17, 1, 6, 0, 'fixed the edit table bug', '14:18:00.000000', '14:26:00.000000'),
(18, 1, 6, 0, 'made user page chart work, other small things', '15:08:00.000000', '18:09:00.000000'),
(19, 1, 6, 0, 'ukhgkhgfkh', '11:34:00.000000', '11:35:00.000000'),
(20, 1, 7, 0, 'worked on user management forms', '15:45:00.000000', '17:49:00.000000'),
(21, 1, 7, 0, 'worked on api and stuff', '17:51:00.000000', '19:50:00.000000'),
(22, 1, 7, 0, 'got estimated hour editor working', '20:00:00.000000', '21:23:00.000000'),
(23, 1, 7, 0, 'got wages to work and added get hours api to server', '21:30:00.000000', '22:01:00.000000'),
(24, 1, 7, 0, 'got money to show up on manage employee page', '22:01:00.000000', '22:29:00.000000'),
(25, 1, 8, 0, 'senior project progress report', '14:53:00.000000', '15:10:00.000000'),
(26, 1, 8, 0, 'senior project progress report', '14:54:00.000000', '15:20:00.000000'),
(27, 1, 8, 1, 'worked on table interface styling', '16:30:00.000000', '16:39:00.000000'),
(28, 1, 8, 0, 'worked on estimated hours table', '16:39:00.000000', '18:03:00.000000'),
(29, 1, 8, 0, 'worked on user historical table', '18:05:00.000000', '18:33:00.000000'),
(30, 1, 8, 0, 'worked on manage employees money preview', '18:34:00.000000', '18:45:00.000000'),
(31, 1, 8, 0, 'showing who is clocked in on manage employees page', '18:50:00.000000', '20:33:00.000000'),
(32, 1, 9, 0, 'hello world', '18:27:00.000000', '18:27:00.000000'),
(33, 1, 9, 0, 'fixed bugs related to not being clocked in', '18:15:00.000000', '18:30:00.000000'),
(34, 1, 9, 0, 'worked on manage user stuff', '18:40:00.000000', '20:10:00.000000'),
(35, 1, 10, 0, 'worked on user manage stuff', '13:25:00.000000', '14:30:00.000000'),
(36, 1, 11, 0, 'worked on rfid packet decoding', '11:32:00.000000', '12:29:00.000000'),
(37, 1, 11, 0, 'tested cron jobs', '15:50:00.000000', '15:55:00.000000'),
(38, 1, 11, 0, 'worked on view profile page', '15:55:00.000000', '16:39:00.000000'),
(39, 1, 11, 0, 'worked on clockout cron job', '16:40:00.000000', '18:22:00.000000'),
(40, 1, 11, 0, 'finished work on cron job', '22:20:00.000000', '22:31:00.000000'),
(41, 1, 11, 0, 'worked on file upload', '22:35:00.000000', '23:45:00.000000'),
(42, 1, 13, 0, 'researched file upload thing', '10:06:00.000000', '10:32:00.000000'),
(43, 1, 13, 0, 'finished file upload thing', '13:33:00.000000', '15:00:00.000000'),
(44, 1, 14, 0, 'presented abstract and progress on senior project', '15:15:00.000000', '15:40:00.000000'),
(45, 1, 14, 0, 'worked on manage employees page', '15:50:00.000000', '18:50:00.000000'),
(46, 1, 14, 0, 'worked on view profile page', '19:00:00.000000', '21:00:00.000000'),
(47, 1, 15, 0, 'fixed estimated times bug', '16:33:00.000000', '16:50:00.000000'),
(48, 1, 15, 0, 'pondered adding user updates on serverside', '16:56:00.000000', '17:04:00.000000'),
(49, 1, 16, 0, 'finished user forced refresh feature', '18:11:00.000000', '19:00:00.000000'),
(50, 1, 17, 0, 'worked on view profile page', '18:32:00.000000', '20:26:00.000000'),
(51, 1, 18, 0, 'got chart to work on view profile page', '14:58:00.000000', '15:44:00.000000'),
(52, 1, 18, 0, 'implemented view page history search feature', '18:25:00.000000', '19:20:00.000000'),
(53, 1, 18, 0, 'worked on editing user history', '19:30:00.000000', '20:24:00.000000'),
(54, 1, 19, 0, 'finished view profile history editing', '14:31:00.000000', '15:32:00.000000'),
(55, 1, 19, 0, 'made settings page', '16:22:00.000000', '17:41:00.000000'),
(56, 1, 19, 0, 'worked on making editing work on the settings page', '17:42:00.000000', '20:10:00.000000'),
(57, 1, 19, 0, 'finished editing on settings page', '21:00:00.000000', '21:36:00.000000'),
(58, 1, 19, 0, 'updated user page w/ algos from view user page', '21:40:00.000000', '21:49:00.000000'),
(59, 1, 20, 0, 'presenting senior project', '15:35:00.000000', '15:52:00.000000'),
(60, 1, 20, 0, 'added extra rfid table in settings page', '17:39:00.000000', '18:20:00.000000'),
(61, 1, 20, 0, 'fixed manage user historical search bug', '18:21:00.000000', '18:22:00.000000'),
(62, 1, 20, 0, 'added incident table to settings page', '18:23:00.000000', '18:51:00.000000'),
(63, 1, 20, 0, 'made map of how pages are connected and redirect', '18:55:00.000000', '19:04:00.000000'),
(64, 1, 21, 0, 'worked on report', '14:10:00.000000', '14:34:00.000000'),
(65, 1, 21, 0, 'did nothing useful', '15:12:00.000000', '16:00:00.000000'),
(66, 1, 22, 0, 'senior project progress report', '15:26:00.000000', '15:46:00.000000'),
(67, 1, 22, 0, 'worked on progress report', '15:49:00.000000', '15:59:00.000000'),
(68, 1, 22, 0, 'looked for journal articles', '16:30:00.000000', '17:11:00.000000'),
(69, 1, 22, 0, 'worked on errfunc optimization', '17:12:00.000000', '17:16:00.000000'),
(70, 1, 22, 0, 'continued looking for journal articles', '17:24:00.000000', '18:28:00.000000'),
(71, 1, 22, 0, 'worked on porting report to libreoffice', '18:30:00.000000', '19:30:00.000000'),
(72, 1, 23, 0, 'worked on presentation', '16:39:00.000000', '21:18:00.000000'),
(73, 1, 23, 0, 'presentation alpha testing', '21:20:00.000000', '21:50:00.000000'),
(74, 1, 24, 0, 'worked on report', '15:36:00.000000', '18:50:00.000000'),
(75, 1, 25, 0, 'worked on report', '16:36:00.000000', '17:07:00.000000'),
(76, 1, 25, 0, 'lunch break', '17:08:00.000000', '17:35:00.000000'),
(77, 1, 25, 0, 'went to class', '17:36:00.000000', '17:37:00.000000'),
(78, 1, 26, 0, 'worked on report', '18:14:00.000000', '18:15:00.000000');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `daydb`
--
ALTER TABLE `daydb`
  ADD PRIMARY KEY (`did`);

--
-- Indexes for table `projdb`
--
ALTER TABLE `projdb`
  ADD PRIMARY KEY (`pid`);

--
-- Indexes for table `rfiddb`
--
ALTER TABLE `rfiddb`
  ADD PRIMARY KEY (`rid`);

--
-- Indexes for table `scannerdb`
--
ALTER TABLE `scannerdb`
  ADD PRIMARY KEY (`sid`);

--
-- Indexes for table `userdb`
--
ALTER TABLE `userdb`
  ADD PRIMARY KEY (`uid`);

--
-- Indexes for table `workdb`
--
ALTER TABLE `workdb`
  ADD PRIMARY KEY (`wid`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `daydb`
--
ALTER TABLE `daydb`
  MODIFY `did` int(5) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `projdb`
--
ALTER TABLE `projdb`
  MODIFY `pid` int(5) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `rfiddb`
--
ALTER TABLE `rfiddb`
  MODIFY `rid` int(5) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `scannerdb`
--
ALTER TABLE `scannerdb`
  MODIFY `sid` int(5) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `userdb`
--
ALTER TABLE `userdb`
  MODIFY `uid` int(5) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `workdb`
--
ALTER TABLE `workdb`
  MODIFY `wid` int(5) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=79;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
