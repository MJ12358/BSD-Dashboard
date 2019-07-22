<?php

// sysctl kstat
// systat -vmstat

class Shell {

  public static function exec($cmd) {
    return trim(shell_exec($cmd));
  }

}

class Convert {

  const BYTES = array(
    'B' => 1,
    'KB' => 1024,
    'MB' => 1048576,
    'GB' => 1073741824,
    'TB' => 1099511627776
  );

  const SECONDS = array(
    'S' => 1,
    'M' => 60,
    'H' => 3600,
    'D' => 86400,
    'Y' => 31557600
  );

  public static function from_bytes($bytes) {
    if ($bytes >= self::BYTES['TB']) {
      $result = round($bytes / self::BYTES['TB'], 2) . ' TB';
    } else if ($bytes >= self::BYTES['GB']) {
      $result = round($bytes / self::BYTES['GB'], 2) . ' GB';
    } else if ($bytes >= self::BYTES['MB']) {
      $result = round($bytes / self::BYTES['MB'], 2) . ' MB';
    } else if ($bytes >= self::BYTES['KB']) {
      $result = round($bytes / self::BYTES['KB'], 2) . ' KB';
    } else if ($bytes >= 1) {
      $result = $bytes . ' B';
    }
    return $result;
  }

  public static function to_bytes($value) {
    // only works if the last char is K,M,G,T etc...
    $num = substr($value, 0, -1);
    switch(strtoupper(substr($value, -1))) {
      case 'K':
        $result = $num * 1024;
        break;
      case 'M':
        $result = $num * pow(1024, 2);
        break;
      case 'G':
        $result = $num * pow(1024, 3);
        break;
      case 'T':
        $result = $num * pow(1024, 4);
        break;
      default:
        $result = $value;
    }
    return round($result);
  }

  public static function to_percent($total, $value) {
    return round(($value * 100) / $total, 2);
  }

  public static function from_seconds($input) {
    $years = floor($input / self::SECONDS['Y']);
    $day_seconds = $input % self::SECONDS['Y'];
    $days = floor($day_seconds / self::SECONDS['D']);
    $hour_seconds = $day_seconds % self::SECONDS['D'];
    $hours = floor($hour_seconds / self::SECONDS['H']);
    $minute_seconds = $hour_seconds % self::SECONDS['H'];
    $minutes = floor($minute_seconds / self::SECONDS['M']);
    $remaining_seconds = $minute_seconds % self::SECONDS['M'];
    $seconds = ceil($remaining_seconds / self::SECONDS['S']);
    $sections = [
      'year' => (int)$years,
      'day' => (int)$days,
      'hour' => (int)$hours,
      'minute' => (int)$minutes,
      'second' => (int)$second
    ];
    $time_parts = array();
    foreach($sections as $name => $value) {
      if($value > 0) {
        $time_parts[] = $value . ' ' . $name . ($value == 1 ? '' : 's');
      }
    }
    return implode(', ', $time_parts);
    // $s = (int)$input;
    // return sprintf('%d:%02d:%02d:%02d', $s/86400, $s/3600%24, $s/60%60, $s%60);
  }

}

// class Cpu {

//   private static $core_count;

//   public static function cores() {
//     $cmd = 'sysctl -n hw.ncpu';
//     self::$core_count = intval(Shell::exec($cmd));
//     return empty(self::$core_count) ? 1 : self::$core_count;
//   }

//   // public function current_load() {
//   //   $cmd = 'top -P ---btIquz';
//   // }

//   public static function frequency() {
//     $cmd = 'sysctl -n dev.cpu.0.freq';
//     return Shell::exec($cmd) . ' Mhz';
//   }

//   public static function load_average() {
//     $rs = sys_getloadavg();
//     $result = array();
//     foreach($rs as $key => $value) {
//       $result[] = round($value, 2);
//     }
//     return $result;
//   }

//   public static function model() {
//     $cmd = 'sysctl -n hw.model';
//     return Shell::exec($cmd);
//   }

//   public static function temperature() {
//     $temps = array();
//     for($i = 0; $i < self::$core_count; $i++) {
//       $cmd = 'sysctl -n dev.cpu.' . $i . '.temperature';
//       $temps[] = floatval(explode('C', Shell::exec($cmd))[0]);
//     }
//     return $temps;
//   }

//   public static function tj_max() {
//     $cmd = 'sysctl -n dev.cpu.0.coretemp.tjmax';
//     return Shell::exec($cmd);
//   }

// }

// class Memory {

//   public static function current_usage() {
//     $cmd = 'top -btIquz | tail -n +4 | head -2 | cut -d : -f2';
//     $result = Shell::exec($cmd);
//     $result = preg_replace("/\n\s/", ', ', $result);
//     $result = explode(', ', $result);
//     $results = array();
//     foreach($result as $k => $v) {
//       $values = explode(' ', $v);
//       if ($values[1] !== 'Total') {
//         $results[] = array(
//           'title' => $values[1],
//           'bytes' => Convert::to_bytes($values[0]),
//           'formatted' => $values[0]
//         );
//       }
//     }
//     return $results;
//   }

//   public static function total() {
//     $cmd = 'sysctl -n hw.physmem';
//     $result = Shell::exec($cmd);
//     return Convert::from_bytes($result);
//   }

//   public static function usage() {
//     $cmd = 'sysctl -n hw.usermem';
//     $result = Shell::exec($cmd);
//     return Convert::from_bytes($result);
//   }

// }

class Network {

  public static $if_count;

  public static function http_connections() {
    if (function_exists('exec')) {
      $www_total_count = 0;
      @exec ('netstat -an | egrep \':80|:443\' | awk \'{print $5}\' | grep -v \':::\*\' |  grep -v \'0.0.0.0\'', $results);
      foreach ($results as $key => $value) {
        $array = explode(':', $value);
        $www_total_count++;
        if (preg_match('/^::/', $value)) {
          $ipaddr = $array[3];
        } else {
          $ipaddr = $array[0];
        }
        if (!in_array($ipaddr, $unique)) {
          $unique[] = $ipaddr;
          $www_unique_count++;
        }
      }
      unset($results);
      return count($unique);
    }
  }

  public static function interface_count() {
    $cmd = 'ifconfig | grep flags | cut -d : -f1';
    self::$if_count = explode(PHP_EOL, Shell::exec($cmd));
    return self::$if_count;
  }

  public static function interface_name() {
    $cmd = 'sysctl -n dev.ix.0.%desc';
    $result = Shell::exec($cmd);
    return trim(explode('PCI', $result)[0]);
  }

  public static function temperature() {
    $cmd = 'sysctl -n dev.ix.0.phy.temp';
    return Shell::exec($cmd);
  }
  // looping through the interfaces adds one second to rtt for each interface
  public static function txrx_current(...$interface) {
    $result = array();
    $value = 'all';
    // foreach(self::$if_count as $key => $value) {
      $cmd = 'netstat -w 1 -q 1 -b4nW | tail -1';
      // $cmd = 'netstat -I ' . $value . ' -w 1 -q 1 -b4nW | tail -1';
      $stats = preg_split('/\s+/', Shell::exec($cmd));
      $bytes_in = $stats[3];
      $bytes_out = $stats[6];
      $result[$value] = array(
        'bytes_in' => $bytes_in,
        'bytes_out' => $bytes_out,
        'formatted_in' => Convert::from_bytes($bytes_in),
        'formatted_out' => Convert::from_bytes($bytes_out)
      );
    // }
    return $result;
  }

  public static function tx_rx_total() {
    $tx_rx = array();
    $tx = 'sysctl -n dev.ix.0.queue0.tx_packets';
    $tx_rx[] = Shell::exec($tx);
    $rx = 'sysctl -n dev.ix.0.queue0.rx_packets';
    $tx_rx[] = Shell::exec($rx);
    return $tx_rx;
  }

}

class System {
  // requires root
  public static function bios_version() {
    $cmd = 'dmidecode -qt bios | egrep \'Vendor|Version\' | cut -d : -f2';
    $result = preg_replace("/\s+/", ' ', Shell::exec($cmd));
    return $result;
  }

  public static function hostname() {
    return gethostname();
  }

  public static function kernel_version() {
		// why not just use uname -r
    $kernel = explode(' ', file_get_contents('/proc/version'));
    return $kernel[2];
  }

	// requires root
  public static function motherboard() {
    $cmd = 'dmidecode -qt baseboard | egrep \'Manufacturer|Product\' | cut -d : -f2';
    return preg_replace("/\s+/", ' ', Shell::exec($cmd));
  }

  public static function os() {
    $cmd = 'uname -i';
    return Shell::exec($cmd);
  }

  public static function process_count() {
    $proc_count = 0;
    $dh = opendir('/proc');
    while ($dir = readdir($dh)) {
      if (is_dir('/proc/' . $dir)) {
        if (preg_match('/^[0-9]+$/', $dir)) {
          $proc_count++;
        }
      }
    }
    return $proc_count;
  }

  public static function top_processes() {
    // would be nice to output 'command' but it may have spaces in it ('args' seems to do the same thing)
    $cmd = 'ps -rAo user,pid,time,nlwp,pcpu,pmem,comm,dsiz,etimes | grep -v root | head -10 | tail -n +2';
    $result = Shell::exec($cmd);
    $result = explode(PHP_EOL, $result);
    $results = array();
    foreach($result as $key => $value) {
      $value = preg_split('/\s+/', $value);
      $results[] = array(
        'user' => $value[0],
        'pid' => $value[1],
        'time' => $value[2],
        'nlwp' => $value[3],
        'pcpu' => $value[4],
        'pmem' => $value[5],
        'comm' => $value[6]
        // 'dsiz' => Convert::from_bytes($value[7])
        // 'etimes' => Convert::from_seconds($value[7])
      );
    }
    return $results;
  }

  public static function uname() {
    $uname = explode(' ', php_uname());
    return $uname[0] . ' ' . $uname[2];
  }

  public static function ups_info() {
    $cmd = 'upsc UPS@localhost | egrep \'device.mfr:|device.model:\' | cut -d : -f2';
    $result = Shell::exec($cmd);
    $result = preg_replace("/\s+/", ' ', $result);
    // $results = array(
    //   'mfr' => $result[0],
    //   'model' => $result[1]
    // );
    return $result;
  }

  public static function ups_stats() {
    $cmd = 'upsc UPS@localhost | egrep \'input.voltage:|battery.voltage:\' | cut -d : -f2';
    $result = Shell::exec($cmd);
    $result = explode(PHP_EOL, $result);
    $results = array(
      'battery_voltage' => array(
        'actual' => $result[0],
        'formatted' => round(log($result[0], 2), 3)
      ),
      'input_voltage' => array(
        'actual' => $result[1],
        'formatted' => round(log($result[1], 2), 3)
      )
    );
    return $results;
  }

	// yeah this is super inaccurate...
  public static function uptime() {
    $cmd = 'sysctl -n kern.boottime';
    $uptime = Shell::exec($cmd);
    $uptime = explode(' ', $uptime)[6];
    return Convert::from_seconds($uptime);
  }

}

class Usb {
  // dev.ehci.0.%desc
  public static function interface_name() {
    $cmd = 'sysctl -n dev.xhci.0.%desc';
    return Shell::exec($cmd);
  }

}

class GenerateData {

  public function __construct($type) {
    // Cpu::cores();
    // Disk::count();
    switch ($type) {
      case 'init':
        self::initial();
        break;
      case 'disk':
        self::disk_poll();
        break;
      case 'mem':
        self::memory_poll();
        break;
      case 'poll':
        self::dynamic_poll();
    }
  }

  private static function initial() {
    echo json_encode(array(
      // 'cpu_frequency' => Cpu::frequency(),
      // 'cpu_load_average' => Cpu::load_average(),
      // 'cpu_model' => Cpu::model(),
      // 'cpu_temps' => Cpu::temperature(),
      // 'cpu_tj_max' => Cpu::tj_max(),
      // 'dataset_usage' => Disk::dataset_usage(),
      // 'disk_info' => Disk::disk_info(),
      // 'disk_interface' => Disk::interface_name(),
      'hostname' => System::hostname(),
      // 'kernel_version' => System::kernel_version(),
      'motherboard' => System::motherboard(),
      'network_if_count' => Network::interface_count(),
      'network_interface' => Network::interface_name(),
      'os' => System::os(),
      'platform_os' => System::uname(),
      'process_count' => System::process_count(),
      'top_processes' => System::top_processes(),
      'system_bios' => System::bios_version(),
      'system_uptime' => System::uptime(),
      'usb_interface' => Usb::interface_name(),
      'ups_info' => System::ups_info()
    ));
  }

  private static function dynamic_poll() {
    echo json_encode(array(
      // 'cpu_frequency' => Cpu::frequency(),
      // 'cpu_load_average' => Cpu::load_average(),
      // 'cpu_temps' => Cpu::temperature(),
      'process_count' => System::process_count(),
      'top_processes' => System::top_processes(),
      // 'disk_io_stats' => Disk::io_stats(),
			'txrx_current' => Network::txrx_current(),
			// 'disk_io_stats_per_device' => Disk::io_stats_per_device()
    ));
  }

  private static function disk_poll() {
    echo json_encode(array(
      // 'dataset_usage' => Disk::dataset_usage(),
      // 'disk_info' => Disk::disk_info(),
      // 'disk_pool_total' => Disk::pool_total(),
      // 'disk_temps' => Disk::temperature(),
      'ups_stats' => System::ups_stats()
    ));
  }

  private static function memory_poll() {
    echo json_encode(array(
      // 'memory_usage' => Memory::current_usage(),
      // 'memory_total' => Memory::total()
      // 'memory_total_usage' => Memory::usage()
    ));
  }

}

$gen_data = new GenerateData($_GET['type']);

 ?>
