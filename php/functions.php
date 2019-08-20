<?php

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
    // only works if the LAST char is K,M,G,T AND there is no space between...
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

 ?>
