/**
 * titanium-darkmode
 *
 * Created by Your Name
 * Copyright (c) 2019 Your Company. All rights reserved.
 */

#import "TiDarkmodeModule.h"
#import "TiBase.h"
#import "TiHost.h"
#import "TiUtils.h"

@implementation TiDarkmodeModule

#pragma mark Internal

- (id)moduleGUID
{
  return @"84d35a8b-b374-4b91-9fb9-3fe0e0b6a7e1";
}

- (NSString *)moduleId
{
  return @"ti.darkmode";
}

#pragma Public APIs

- (TiColor *)fetch:(id)color
{
  ENSURE_SINGLE_ARG(color, NSString);

  if ([TiUtils isIOSVersionOrGreater:@"13.0"]) {
    return [[TiColor alloc] initWithColor:[UIColor colorNamed:color] name:nil];
  } else {
    return [[TiColor alloc] initWithColor:UIColor.blackColor name:@"black"];
  }
}

@end
