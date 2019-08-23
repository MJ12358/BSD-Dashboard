<?php
require_once '../functions.php';

class Cpu {

	protected function getCores() {
    $cmd = 'sysctl -n hw.ncpu';
    $result = intval(Shell::exec($cmd));
    return empty($result) ? 1 : $result;
	}

}

?>