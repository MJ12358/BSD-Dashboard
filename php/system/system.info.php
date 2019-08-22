<?php
require_once 'system.php';

class SystemInfo extends System {

	public function __construct() {
		echo json_encode(array(
			'Hostname' => gethostname(),
			'Motherboard' => $this->getMotherboard(),
			'System BIOS' => $this->getBiosVersion(),
			'CPU Model' => $this->getCpuModel(),
			'OS' => $this->getOperatingSystem(),
			'Platform OS' => $this->getPlatformOs(),
			'System Uptime' => $this->getUptime(),
			'Disk Interface' => $this->getDiskInterface(),
			'Network Interface' => $this->getNetworkInterface(),
			'USB Interface' => $this->getUsbInterface()
		));
	}

	// requires root
  public function getBiosVersion() {
    $cmd = 'dmidecode -qt bios | egrep \'Vendor|Version\' | cut -d : -f2';
    return preg_replace("/\s+/", ' ', Shell::exec($cmd));
  }

	// requires root
  public function getMotherboard() {
    $cmd = 'dmidecode -qt baseboard | egrep \'Manufacturer|Product\' | cut -d : -f2';
    return preg_replace("/\s+/", ' ', Shell::exec($cmd));
	}
	
	// dmesg | grep -i cpu | head -n 1 | cut -d : -f2 (detailed cpu info)
	public function getCpuModel() {
		$cmd = 'sysctl -n hw.model';
    return Shell::exec($cmd);
  }

  public function getOperatingSystem() {
    $cmd = 'uname -i';
    return Shell::exec($cmd);
  }

  public function getPlatformOs() {
		$cmd = 'uname -mrs';
		return Shell::exec($cmd);
	}

	public function getDiskInterface() {
    $cmd = 'sysctl -n dev.ahci.0.%desc';
    return Shell::exec($cmd);
	}

	public function getNetworkInterface() {
    $cmd = 'sysctl -n dev.ix.0.%desc';
    $result = Shell::exec($cmd);
    return trim(explode('PCI', $result)[0]);
	}
	
	// dev.ehci.0.%desc
  public static function getUsbInterface() {
    $cmd = 'sysctl -n dev.xhci.0.%desc';
    return Shell::exec($cmd);
  }

}

$system_info = new SystemInfo();

?>