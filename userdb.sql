-- phpMyAdmin SQL Dump
-- version 4.7.7
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Mar 11, 2018 at 11:48 PM
-- Server version: 10.1.31-MariaDB
-- PHP Version: 7.0.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `id1567281_j2inn`
--

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
  `days` varchar(512) COLLATE utf8_unicode_ci NOT NULL DEFAULT '{}'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `userdb`
--

INSERT INTO `userdb` (`uid`, `email`, `salt`, `hashpw`, `fname`, `lname`, `admin`, `wage`, `days`) VALUES
(1, 'koppanyh@j2inn.com', '4a9216297446f0ccd048937681763f61', '73aee64b104b2d9c2f1143bd3b6dca4b6336806f38dc8d0037a9bdf5974a16d9251a8a67684bf09c9969ecfe7b7eba5d2119ab8d9e382b80edf49b15202bc39f', 'Koppany', 'Horvath', 1, 15.2, '{}');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `userdb`
--
ALTER TABLE `userdb`
  ADD PRIMARY KEY (`uid`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `userdb`
--
ALTER TABLE `userdb`
  MODIFY `uid` int(5) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
