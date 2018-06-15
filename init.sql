-- phpMyAdmin SQL Dump
-- version 4.7.7
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Jun 15, 2018 at 02:43 AM
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
(1, 'email@email.com', '1220769645ca86b71f6ad82a71e7db2a', '447faf677943aec859381e0954e3e1f89f2284e682fd567b1ba9ec799739e0c753bfb4bdad67b1f95da80585947c9cbcca9e9316a49884da1177548622f7bb40', 'Admin', 'Admin', 1, 0, '{\"0\":[0,\"00:00\"],\"1\":[8,\"09:00\"],\"2\":[8,\"09:00\"],\"3\":[8,\"09:00\"],\"4\":[8,\"09:00\"],\"5\":[8,\"09:00\"],\"6\":[0,\"00:00\"]}', 'user.png', '00000000000000000000');

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
  MODIFY `did` int(5) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;

--
-- AUTO_INCREMENT for table `projdb`
--
ALTER TABLE `projdb`
  MODIFY `pid` int(5) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;

--
-- AUTO_INCREMENT for table `rfiddb`
--
ALTER TABLE `rfiddb`
  MODIFY `rid` int(5) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;

--
-- AUTO_INCREMENT for table `scannerdb`
--
ALTER TABLE `scannerdb`
  MODIFY `sid` int(5) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;

--
-- AUTO_INCREMENT for table `userdb`
--
ALTER TABLE `userdb`
  MODIFY `uid` int(5) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `workdb`
--
ALTER TABLE `workdb`
  MODIFY `wid` int(5) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
